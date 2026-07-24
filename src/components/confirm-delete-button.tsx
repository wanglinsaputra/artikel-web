"use client";

export function ConfirmDeleteButton({
  action,
  id,
  label = "Hapus",
  message = "Yakin hapus akun ini? Tidak bisa dibatalkan.",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: number | string;
  label?: string;
  message?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="btn-danger min-h-10" aria-label={label}>
        {label}
      </button>
    </form>
  );
}
