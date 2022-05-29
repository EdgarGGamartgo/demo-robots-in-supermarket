import {
  ReactElement,
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
} from "react";
import PrismaZoom from "react-prismazoom";
import io, { Socket } from "socket.io-client";
import { useQuery } from "react-query";

import { Product } from "../models";
import { useCurrentLocation } from "../hooks/UseCurrentLocation";
import { axiosGetProducts } from "../services/StoreMapServices";
import Modal from "./Modal";

export default function StoreMapComponent(): ReactElement {
  const mapElement = useRef<any>(null);

  const [showModal, setShowModal] = useState<any>(false);

  const [currentHoveredProduct, setCurrentHoveredProduct] = useState<Product>();

  const [products, setProducts] = useState<Product[][]>([]);

  const [viewportSize, setViewportSize] = useState<number[]>([0, 0]);

  const [mapSize, setMapSize] = useState<{ y: number; x: number }>({
    x: 0,
    y: 0,
  });

  const [socket, setSocket] = useState<Socket>();

  const [take, setTake] = useState<number>(0);
  const [skip, setSkip] = useState<number>(0);
  const [pageLimit, setPageLimit] = useState<number>(0);

  let currentLocation = useCurrentLocation();

  const fetchProducts = async (): Promise<{
    data: Product[];
    count: number;
  }> => {
    const take = Number(currentLocation?.get?.("take") ?? 1000);
    const skip = Number(currentLocation?.get?.("skip") ?? 0);
    const pageLimit = Number(currentLocation?.get?.("pageLimit") ?? 1);
    setTake(take);
    setPageLimit(pageLimit);
    setSkip(skip);
    return await axiosGetProducts(take, skip);
  };

  const { data, isError, isLoading } = useQuery("products", fetchProducts);

  useEffect(() => {
    if (isError) setProducts([]);
    else {
      if (take && data?.count) {
        (async () => {
          setProducts([data.data]);

          const pages = (data!.count - skip) / (take as number);
          let counter = [];
          for (let z = 1; z < (pageLimit ? pageLimit : pages); z++) {
            counter.push(z);
          }

          const finalProducts = await Promise.all(
            counter.map(async (c) => {
              return (
                (await axiosGetProducts(Number(take), take * c + skip))?.data ??
                []
              );
            })
          );

          finalProducts?.length &&
            setProducts((prevProducts) => [...prevProducts, ...finalProducts]);
        })();
      }
    }
  }, [data, isError]);

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:4000`);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [setSocket]);

  useEffect(() => {
    const productListener = (message: { data: Product }): void => {
      setProducts((prevProducts: Product[][]) => {
        const newProducts = [...prevProducts];
        if (message?.data?.id) {
          newProducts.forEach((newProduct) => {
            const idx = newProduct.findIndex(
              ({ id }) => id === message.data.id
            );
            if (idx !== -1) newProduct[idx] = message.data;
            else newProduct.push(message.data);
          });
        }
        return newProducts;
      });
    };

    const productDeleteListener = (message: { data: number }): void => {
      setProducts((prevProducts: Product[][]) => {
        const newProducts = [...prevProducts];
        if (message?.data) {
          newProducts.forEach((newProduct) => {
            const idx = newProduct.findIndex(({ id }) => id === message.data);
            if (idx !== -1) newProducts.splice(idx, 1);
          });
        }
        return newProducts;
      });
    };

    socket?.on?.("product-update", productListener);
    socket?.on?.("product-delete", productDeleteListener);

    return () => {
      socket?.off?.("product-update", productListener);
    };
  }, [socket]);

  useEffect(() => {
    const x = mapElement?.current?.ref?.current?.clientWidth;
    const y = mapElement?.current?.ref?.current?.clientHeight;

    if (x >= 0 && y >= 0) {
      setMapSize({
        x,
        y,
      });
    }
  }, [viewportSize]);

  useLayoutEffect(() => {
    const updateSize = () => {
      setViewportSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", updateSize);

    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const setProductPositionX = (x: number): string => {
    if (x === 100) return `${Math.floor(mapSize.x - 6)}px`;
    return `${Math.floor((x * mapSize.x) / 100)}px`;
  };

  const setProductPositionY = (y: number): string => {
    if (y === 100) return `${Math.floor(mapSize.y - 6)}px`;
    return `${Math.floor((y * mapSize.y) / 100)}px`;
  };

  const onClickOnZoomOut = () => {
    mapElement.current.zoomOut(1);
  };

  const onClickOnZoomIn = () => {
    mapElement.current.zoomIn(1);
  };

  const setHoveredProduct = (x: number, y: number, id: number) => {
    setCurrentHoveredProduct({ id, x, y });
  };

  return (
    <>
      <Modal showModal={showModal} setShowModal={setShowModal} />
      <div className="w-screen h-screen bg-blue-900 flex flex-col justify-center items-center">
        {currentHoveredProduct?.id && (
          <div className="inline-flex mb-[1em]">
            <span className="bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-full">
              X: {`${currentHoveredProduct?.x ?? ""}`}. Y:{" "}
              {`${currentHoveredProduct?.y ?? ""}`}.{" "}
              <button
                onClick={() => setShowModal(true)}
                className="text-gray-800 font-bold"
              >
                See details.
              </button>
            </span>
          </div>
        )}
        <div className="bg-indigo-900 w-[90%] h-[86%] relative overflow-hidden">
          <PrismaZoom
            className="bg-neutral-400 w-[100%] h-[100%]"
            ref={mapElement}
            maxZoom={8}
          >
            {!isLoading &&
              !isError &&
              products.map((product) =>
                product.map(({ x, y, id }, i) => (
                  <span
                    data-tip
                    data-for={`${id}`}
                    key={i}
                    onMouseOver={() => setHoveredProduct(x, y, id)}
                    className={`absolute h-[6px] w-[6px] bg-sky-800 rounded-full cursor-pointer`}
                    style={{
                      left: setProductPositionX(x),
                      bottom: setProductPositionY(y),
                    }}
                  ></span>
                ))
              )}
            {!isError && isLoading ? (
              <span
                className={`absolute text-lg  bg-sky-800 rounded-full p-[0.8em]`}
                style={{
                  left: setProductPositionX(47),
                  bottom: setProductPositionY(50),
                }}
              >
                Loading...
              </span>
            ) : null}
            {!isLoading && isError ? (
              <span
                className={`absolute text-lg  bg-red-800 rounded-full p-[0.8em]`}
                style={{
                  left: setProductPositionX(40),
                  bottom: setProductPositionY(50),
                }}
              >
                Error loading map. Please try again later.
              </span>
            ) : null}
          </PrismaZoom>
        </div>
        <div className="inline-flex mt-[1em]">
          <button
            onClick={onClickOnZoomIn}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
          >
            Zoom In
          </button>
          <button
            onClick={onClickOnZoomOut}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
          >
            Zoom Out
          </button>
        </div>
      </div>
    </>
  );
}
