// Estilos compartilhados entre Login e Cadastro.
// Mobile (tela cheia): campos de 50px com cantos de 10px. Desktop (modal): campos de 40px quase retos.
export const authInput =
  'h-[50px] rounded-[10px] border-field bg-transparent px-4 text-sm text-foreground placeholder:text-muted-dim focus:border-accent focus:ring-0 focus-visible:outline-none md:h-10 md:rounded-[3px]'

export const authSubmit =
  'flex h-[60px] w-full items-center justify-center rounded-[10px] bg-accent text-base font-bold text-[#1a100b] transition hover:brightness-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-foreground disabled:opacity-60 md:h-[45px] md:rounded-[3px]'

export const authSocial =
  'flex h-10 w-full items-center justify-center gap-3 rounded-[3px] border border-field text-[13px] font-medium text-muted transition hover:border-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent'
