import poweredByBiconomy from "../assets/images/powered-by-biconomy.svg";

function Footer() {
  return (
    <footer className="fixed bottom-0 flex items-center w-full h-12 px-6 py-4">
      <a target="_blank" href="https://biconomy.io/" rel="noreferrer">
        <img src={poweredByBiconomy} alt="Powered by Biconomy" />
      </a>
    </footer>
  );
}

export default Footer;
