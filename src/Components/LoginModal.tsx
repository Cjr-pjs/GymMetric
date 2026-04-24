import { useState } from 'react';

type LoginResult = {
  name: string;
};

type LoginModalProps = {
  open: boolean;
  isSubmitting?: boolean;
  onComplete: (result: LoginResult) => Promise<void> | void;
};

export function LoginModal({ open, isSubmitting = false, onComplete }: LoginModalProps) {
  const [name, setName] = useState('');

  if (!open) {
    return null;
  }

  const trimmedName = name.trim();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[radial-gradient(circle_at_top_left,rgba(53,116,96,0.22),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(126,155,132,0.18),transparent_38%),linear-gradient(180deg,#090b0a,#111513_60%,#0b0d0c)] p-4 sm:p-8">
      <div className="mx-auto flex min-h-full w-full max-w-2xl items-center py-8">
        <div className="w-full overflow-hidden rounded-[28px] border border-[#2f3733] bg-[#111513]/95 shadow-[0_28px_90px_rgba(0,0,0,0.55)] backdrop-blur">
          <div className="relative overflow-hidden border-b border-[#2a322e] bg-[linear-gradient(170deg,#121917_0%,#0f1311_62%,#0b0d0c_100%)] p-7 sm:p-8">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#78b596]/12 blur-3xl" />
            <p className="inline-flex rounded-full border border-[#314037] bg-[#17231d] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-[#9dc4af]">
              Primeiro acesso
            </p>
            <h2 className="mt-5 text-3xl font-semibold leading-tight text-[#eef2ef]">Crie sua conta</h2>
            <p className="mt-3 text-sm leading-relaxed text-[#a7b1ab]">
              Digite seu nome para entrar no app e exibir sua identificação no canto superior direito.
            </p>
          </div>

          <form
            className="space-y-5 p-6 sm:p-8"
            onSubmit={(event) => {
              event.preventDefault();

              if (!trimmedName) {
                return;
              }

              void onComplete({ name: trimmedName });
            }}
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-[#c7d0cb]" htmlFor="user-name">
                Nome
              </label>
              <input
                id="user-name"
                type="text"
                autoComplete="name"
                autoFocus
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Como você quer ser chamado?"
                className="w-full rounded-2xl border border-[#2d3732] bg-[#131915] px-4 py-3 text-[#e8eeea] outline-none transition placeholder:text-[#6d7772] focus:border-[#6ea98c]"
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !trimmedName}
              className="w-full rounded-xl bg-[linear-gradient(135deg,#5a9d80,#74b495)] px-4 py-3 font-semibold text-[#092115] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Salvando perfil...' : 'Entrar no GymMetric'}
            </button>

            <p className="text-xs text-[#73807a]">Seu nome fica salvo no perfil e pode ser usado para personalizar futuras telas.</p>
          </form>
        </div>
      </div>
    </div>
  );
}

export type { LoginResult };
