import { AlertCircle } from "lucide-react";

interface ErrorMessageProps {
  message?: string;
}

function ErrorMessage({ message = "Something went wrong. Please try again." }: ErrorMessageProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <AlertCircle className="text-destructive" size={32} />
      <p className="text-destructive">{message}</p>
    </div>
  );
}

export default ErrorMessage;