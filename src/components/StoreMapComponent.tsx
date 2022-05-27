import React, { ReactElement, useRef } from "react";
import PrismaZoom from "react-prismazoom";
import { StoreMapComponentStyles as Styles } from "../styles";

export default function StoreMapComponent(): ReactElement {
  const mapElement = useRef<ReactElement>(null);

  const onZoomChange = (zoom: number): void => {};

  return (
    <div className="w-screen h-screen bg-indigo-900 flex flex-col justify-center items-center">
      <div className="bg-indigo-900 w-[90%] h-[90%] relative rounded-2xl overflow-hidden">
        <PrismaZoom
          className="bg-neutral-400 w-[100%] h-[100%] rounded-2xl"
          ref={mapElement}
          maxZoom={8}
          onZoomChange={onZoomChange}
        >
          <span className={Styles.ProductLocationStyles}></span>
        </PrismaZoom>
      </div>
    </div>
  );
}
