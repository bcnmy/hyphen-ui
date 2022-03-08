function FarmPositions() {
  return (
    <article className="mb-2.5 rounded-10 bg-white p-2.5">
      <header className="relative my-6 flex items-center justify-center px-10">
        <div className="absolute left-10">
          <button className="mr-7 text-xs text-hyphen-purple">
            Active Farms
          </button>
        </div>

        <h2 className="text-xl text-hyphen-purple">Your Farms</h2>
      </header>

      <section className="flex h-auto items-start justify-center">
        Your Farms
      </section>
    </article>
  );
}

export default FarmPositions;
