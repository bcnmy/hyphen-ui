import { Outlet } from 'react-router-dom';

function Farms() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 xl:w-256 xl:px-0">
      <Outlet />
    </main>
  );
}

export default Farms;
