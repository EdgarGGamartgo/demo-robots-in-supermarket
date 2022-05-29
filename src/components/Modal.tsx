import { Product, Robot } from "../models";

const Modal = ({
  showModal,
  setShowModal,
  stackedProducts,
  robot,
}: {
  stackedProducts?: Product[];
  robot?: Robot;
  showModal: boolean;
  setShowModal: (value: boolean) => void;
}) => {
  return (
    <>
      {showModal ? (
        <>
          <div className="flex justify-center items-center overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
            <div className="relative w-auto my-6 mx-auto max-w-3xl">
              <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                <div className="flex items-start justify-between p-5 border-b border-solid border-gray-300 rounded-t ">
                  <h3 className="text-xl pr-[1em] font=semibold">
                    {stackedProducts?.length ? (
                      <>
                        Stacked Products at X: {stackedProducts[0].x}, Y:{" "}
                        {stackedProducts[0].y}
                      </>
                    ) : robot?.id ? (
                      <>
                        Robot at X: {robot.x}. Y: {robot.y}
                      </>
                    ) : null}
                  </h3>
                </div>
                <div className="relative p-6 flex-auto">
                  <ul>
                    {stackedProducts?.length ? (
                      <>
                        {stackedProducts?.map?.(({ id }) => (
                          <li key={id}>ID: {id}</li>
                        ))}
                      </>
                    ) : robot?.id ? (
                      <>
                        <li>ID: {robot.id}</li>
                        <li>Name: {robot.name}</li>
                        <li>X: {robot.x}</li>
                        <li>Y: {robot.y}</li>
                        <li>
                          Orientation:{" "}
                          {robot.orientation ? robot.orientation : "Unknown"}
                        </li>
                        <li>Speed: {robot.speed}</li>
                        <li>Dest_x: {robot.dest_x}</li>
                        <li>Dest_y: {robot.dest_y}</li>
                      </>
                    ) : null}
                  </ul>
                </div>
                <div className="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
                  <button
                    className="text-red-500 background-transparent font-bold uppercase px-6 py-2 text-sm outline-none focus:outline-none mr-1 mb-1"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default Modal;
