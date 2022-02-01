import poweredByBiconomy from "../assets/images/powered-by-biconomy.svg";

function Footer() {
  return (
    <footer className="flex items-center w-full px-6 py-4">
      <a target="_blank" href="https://biconomy.io/" rel="noreferrer">
        <img src={poweredByBiconomy} alt="Powered by Biconomy" />
      </a>
    </footer>
  );
}

export default Footer;
