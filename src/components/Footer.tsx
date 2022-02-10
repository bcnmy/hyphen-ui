import { HiOutlineArrowSmRight } from "react-icons/hi";
import poweredByBiconomy from "../assets/images/powered-by-biconomy.svg";

function Footer() {
  return (
    <footer className="sticky bottom-0 flex w-full items-center px-6 py-4">
      <a target="_blank" href="https://biconomy.io/" rel="noreferrer">
        <img src={poweredByBiconomy} alt="Powered by Biconomy" />
      </a>
      <a
        href="https://discord.com/channels/692403655474937856/841926541235585035"
        target="_blank"
        rel="noreferrer"
        className="absolute right-4 flex text-white"
      >
        Support <HiOutlineArrowSmRight className="h-5 w-5 -rotate-45" />
      </a>
    </footer>
  );
}

export default Footer;
