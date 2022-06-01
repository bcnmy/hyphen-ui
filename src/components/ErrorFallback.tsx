import PrimaryButtonLight from './Buttons/PrimaryButtonLight';
import SecondaryButtonLight from './Buttons/SecondaryButtonLight';
import Layout from './Layout';
import MailTo from './MailTo';

function ErrorFallback({ error }: { error: Error }) {
  return (
    <Layout>
      <div className="my-12.5">
        <div className="mx-auto w-full px-6 xl:max-w-170 xl:px-0">
          <div className="flex h-auto flex-col gap-8 rounded-10 bg-white p-7.5 shadow-lg xl:p-12.5">
            <div role="alert">
              <p className="mb-6 text-center text-xl text-hyphen-purple">
                Oh snap! We encountered a glitch 🚧
              </p>
              <pre className="h-32 overflow-auto rounded-2.5 bg-red-100 p-4 text-xs text-red-500">
                {error.message}
              </pre>
              <div className="mt-8 grid grid-cols-1 gap-2 xl:grid-cols-2 xl:gap-20">
                <SecondaryButtonLight onClick={() => window.location.reload()}>
                  Reset
                </SecondaryButtonLight>
                <MailTo
                  email="hyphen-support@biconomy.io"
                  subject="Hyphen Error Report"
                  body={JSON.stringify({
                    name: error.name,
                    message: error.message,
                    stack: error.stack,
                  })}
                >
                  <PrimaryButtonLight>Send Report</PrimaryButtonLight>
                </MailTo>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ErrorFallback;
