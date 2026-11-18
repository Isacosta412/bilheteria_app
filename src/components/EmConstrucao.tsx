import { useAuth } from '@/hooks/useAuth';
import { EstadoVazio } from './EstadoVazio';
import { Tela } from './Tela';

/** Placeholder das abas que serão implementadas nas próximas etapas (F02–F06). */
export function EmConstrucao({ titulo, etapa }: { titulo: string; etapa: string }) {
  const { usuario } = useAuth();
  return (
    <Tela centralizar>
      <EstadoVazio
        icone="🚧"
        titulo={titulo}
        descricao={`Olá, ${usuario?.nome ?? ''}! Esta tela chega na etapa ${etapa}.`}
      />
    </Tela>
  );
}
