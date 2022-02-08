import { HiArrowSmLeft } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

interface IAddLiquidity {
  apy: number;
  currentLiquidity: number;
  network: string;
  tokenSymbol: string;
  totalLiquidity: number;
}

function AddLiquidity() {
  const navigate = useNavigate();

  return (
    <article className="my-24 rounded-[40px] bg-white p-[50px] pt-2.5">
      <header className="relative my-6 flex items-center justify-center px-10">
        <div className="absolute left-0">
          <button
            className="flex items-center rounded text-hyphen-gray-200 hover:bg-gray-100"
            onClick={() => navigate(-1)}
          >
            <HiArrowSmLeft className="h-6 w-auto" />
          </button>
        </div>

        <h2 className="text-xl text-hyphen-purple">Add Liquidity</h2>
      </header>
    </article>
  );
}

export default AddLiquidity;
