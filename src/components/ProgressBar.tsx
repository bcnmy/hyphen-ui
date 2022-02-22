interface IProgressBar {
  currentProgress: number;
  totalProgress: number;
}

function ProgressBar({ currentProgress, totalProgress }: IProgressBar) {
  const completed = (currentProgress / totalProgress) * 100;

  return (
    <div className="flex h-4.5 w-full items-center rounded-full bg-hyphen-purple p-1">
      <div
        className="h-full rounded-full bg-white"
        style={{ width: `${completed}%` }}
      ></div>
    </div>
  );
}

export default ProgressBar;
