import { HiArrowSmLeft } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import StakingPositionOverview from '../StakingPositionOverview';

function AddStakingPosition() {
  const navigate = useNavigate();

  return (
    <>
      {/* {selectedChain && selectedToken && liquidityAmount ? (
        <ApprovalModal
          executeTokenApproval={executeTokenApproval}
          isVisible={isApprovalModalVisible}
          onClose={hideApprovalModal}
          selectedChainName={selectedChain.name}
          selectedTokenName={selectedToken.name}
          transferAmount={parseFloat(liquidityAmount)}
        />
      ) : null} */}
      <article className="my-24 rounded-10 bg-white p-12.5 pt-2.5">
        <header className="relative mt-6 mb-12 flex items-center justify-center border-b px-10 pb-6">
          <div className="absolute left-0">
            <button
              className="flex items-center rounded text-hyphen-gray-400"
              onClick={() => navigate(-1)}
            >
              <HiArrowSmLeft className="h-5 w-auto" />
            </button>
          </div>

          <h2 className="text-xl text-hyphen-purple">Add Staking Position</h2>
        </header>

        <StakingPositionOverview />
      </article>
    </>
  );
}

export default AddStakingPosition;
