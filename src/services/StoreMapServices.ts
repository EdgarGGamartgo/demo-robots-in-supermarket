import axios from "axios";
import { Product, Robot } from "../models";

export const axiosGetProducts = async (
  take: number,
  skip: number = 0
): Promise<{
  data: Product[];
  count: number;
}> => {
  return (
    (
      await axios.get(
        `http://${window.location.hostname}:4000?take=${take}&skip=${skip}`
      )
    )?.data ?? []
  );
};

export const getAllProductsByPosition = async (
  x: number,
  y: number
): Promise<Product[]> => {
  return (
    (
      await axios.get(
        `http://${window.location.hostname}:4000/by-position?x=${x}&y=${y}`
      )
    )?.data ?? []
  );
};

export const getAllRobots = async (
  numberOfRobots: number
): Promise<Robot[]> => {
  return (
    (
      await axios.get(
        `http://${window.location.hostname}:4000/robots?numberOfRobots=${numberOfRobots}`
      )
    )?.data ?? []
  );
};
