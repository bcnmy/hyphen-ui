import { HiOutlineArrowSmRight } from "react-icons/hi";
import poweredByBiconomy from "../assets/images/powered-by-biconomy.svg";

function Footer() {
  return (
    <footer className="sticky bottom-0 z-20 flex w-full items-center justify-center bg-black px-6 py-4">
      <a
        target="_blank"
        href="https://biconomy.io/"
        rel="noreferrer"
        className="absolute left-6"
      >
        <img src={poweredByBiconomy} alt="Powered by Biconomy" />
      </a>
      <div className="mb-0.5 flex text-[#808080]">
        <a
          href="https://discord.com/channels/692403655474937856/841926541235585035"
          target="_blank"
          rel="noreferrer"
          className="hover:text-white"
        >
          Join our Discord
        </a>
        <p className="mx-2">|</p>
        <a
          href="mailto:hyphen-support@biconomy.io"
          className="hover:text-white"
        >
          Email Us
        </a>
      </div>
    </footer>
  );
}

export default Footer;
