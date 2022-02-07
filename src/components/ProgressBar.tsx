interface IProgressBar {
  currentProgress: number;
}

function ProgressBar({ currentProgress }: IProgressBar) {
  return (
    <div className="flex h-[18px] w-full items-center rounded-full bg-hyphen-purple px-0.5">
      <div
        className="h-[14px] rounded-full bg-white"
        style={{ width: `${currentProgress}%` }}
      ></div>
    </div>
  );
}

export default ProgressBar;
