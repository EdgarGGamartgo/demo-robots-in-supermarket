import axios from "axios";
import { Product } from "../models";

export const axiosGetProducts = async (
  take: number,
  skip: number = 0
): Promise<{
  data: Product[];
  count: number;
}> => {
  return (
    await axios.get(
      `http://${window.location.hostname}:4000?take=${take}&skip=${skip}`
    )
  ).data;
};
