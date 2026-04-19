interface Props {
  password: string;
}

export default function PasswordChecklist({ password }: Props) {
  const checks = {
    length: password.length >= 8,
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };

  const Item = ({
    ok,
    text,
  }: {
    ok: boolean;
    text: string;
  }) => (
    <p
      className={`text-xs flex items-center gap-2 ${
        ok ? "text-green-600" : "text-gray-400"
      }`}
    >
      {ok ? "✓" : "○"} {text}
    </p>
  );

  if (!password) return null;

  return (
    <div className="mt-3 space-y-1">
      <Item ok={checks.length} text="At least 8 characters" />
      <Item ok={checks.number} text="One number" />
      <Item ok={checks.special} text="One special character" />
    </div>
  );
}