interface IMailToProps {
  email: string;
  subject: string;
  body: string;
  children: React.ReactNode;
}

function MailTo({ email, subject = '', body, children }: IMailToProps) {
  let params = subject || body ? '?' : '';
  if (subject) params += `subject=${encodeURIComponent(subject)}`;
  if (body) params += `${subject ? '&' : ''}body=${encodeURIComponent(body)}`;

  return <a href={`mailto:${email}${params}`}>{children}</a>;
}

export default MailTo;
