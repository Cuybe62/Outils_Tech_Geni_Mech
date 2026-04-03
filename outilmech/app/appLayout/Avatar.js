export default function Avatar() {
  return (
    <div className=" w-full avatar avatar-placeholder items-end  is-drawer-close:tooltip-right ">
      <button className=" is-drawer-open:hidden   hover:mask-b-from-50% hover:mask-b-to-99%   ">
        <div className="bg-neutral text-neutral-content w-10 rounded-full shadow ">
          <span className="text-3xl">D</span>
        </div>
      </button>
      <button className=" w-full is-drawer-close:hidden hover:shadow-2xl">
        <div
          role="alert"
          className=" bg-base-300 p-2 w-full alert alert-vertical sm:alert-horizontal  "
        >
          <div className="bg-neutral text-neutral-content w-10 p-2  rounded-full shadow ">
            <span className="text-3xl ">D</span>
          </div>
          <div>
            <h3 className="font-bold">Nom</h3>
          </div>
        </div>
      </button>
    </div>
  );
}
