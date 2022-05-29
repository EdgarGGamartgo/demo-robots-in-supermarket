import React, {
  ReactElement,
  useRef,
  useEffect,
  useState,
  useLayoutEffect,
} from "react";
import PrismaZoom from "react-prismazoom";
import io, { Socket } from "socket.io-client";
import axios from "axios";

import { Product } from "../models";

export default function StoreMapComponent(): ReactElement {
  const mapElement = useRef<any>(null);

  const [products, setProducts] = useState<Product[]>([]);

  const [viewportSize, setViewportSize] = useState<number[]>([0, 0]);

  const [mapSize, setMapSize] = useState<{ y: number; x: number }>({
    x: 0,
    y: 0,
  });

  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const newSocket = io(`http://${window.location.hostname}:4000`);
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [setSocket]);

  useEffect(() => {
    const productListener = (message: { data: Product }): void => {
      setProducts((prevMessages: Product[]) => {
        const newMessages = [...prevMessages];
        if (message?.data?.id) {
          const idx = newMessages.findIndex(({ id }) => id === message.data.id);
          if (idx !== -1) newMessages[idx] = message.data;
          else newMessages.push(message.data);
        }
        return newMessages;
      });
    };

    socket?.on?.("product-update", productListener);

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

  useEffect(() => {
    (async () => {
      const products = await axios.get(
        `http://${window.location.hostname}:4000`
      );
      if (products?.data?.length) setProducts(products.data);
    })();
  }, []);

  useLayoutEffect(() => {
    const updateSize = () => {
      setViewportSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", updateSize);

    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);

  const onZoomChange = (zoom: number): void => {};

  const setProductPositionX = (x: number): string => {
    if (x === 100) return `${Math.floor(mapSize.x - 6)}px`;
    return `${Math.floor((x * mapSize.x) / 100)}px`;
  };

  const setProductPositionY = (y: number): string => {
    if (y === 100) return `${Math.floor(mapSize.y - 6)}px`;
    return `${Math.floor((y * mapSize.y) / 100)}px`;
  };

  return (
    <div className="w-screen h-screen bg-blue-900 flex flex-col justify-center items-center">
      <div className="bg-indigo-900 w-[90%] h-[90%] relative overflow-hidden">
        <PrismaZoom
          className="bg-neutral-400 w-[100%] h-[100%]"
          ref={mapElement}
          maxZoom={8}
          onZoomChange={onZoomChange}
        >
          {products.map(({ x, y }, i) => (
            <span
              key={i}
              className={`absolute h-[6px] w-[6px] bg-sky-800 rounded-full`}
              style={{
                left: setProductPositionX(x),
                bottom: setProductPositionY(y),
              }}
            ></span>
          ))}
        </PrismaZoom>
      </div>
    </div>
  );
}
