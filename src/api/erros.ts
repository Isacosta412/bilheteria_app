/**
 * Mensagens amigáveis para cada `erro.codigo` da API.
 * Nunca mostre ao usuário o JSON cru, o status HTTP ou um stack trace: use traduzirErro().
 */
export const MENSAGENS_ERRO: Record<string, string> = {
  // genéricos
  DADOS_INVALIDOS: 'Confira os dados informados.',
  JSON_INVALIDO: 'Não foi possível enviar os dados. Tente novamente.',
  CORPO_MUITO_GRANDE: 'Os dados enviados são grandes demais.',
  ROTA_NAO_ENCONTRADA: 'Recurso não encontrado.',
  NAO_ENCONTRADO: 'O item procurado não existe mais.',
  REGISTRO_DUPLICADO: 'Já existe um cadastro com esses dados.',
  VIOLACAO_CHAVE_ESTRANGEIRA: 'Este item está em uso e não pode ser alterado ou removido.',
  CONFLITO_CONCORRENTE: 'Outra pessoa alterou esses dados agora mesmo. Atualize a tela e tente de novo.',
  SERVIDOR_OCUPADO: 'O sistema está com muito movimento. Tente novamente em instantes.',
  MUITAS_TENTATIVAS: 'Muitas tentativas em pouco tempo. Aguarde alguns minutos e tente de novo.',
  ERRO_INTERNO: 'Algo deu errado do nosso lado. Tente novamente em instantes.',

  // autenticação e permissões
  NAO_AUTENTICADO: 'Faça login para continuar.',
  TOKEN_INVALIDO: 'Sua sessão expirou. Entre novamente.',
  CREDENCIAIS_INVALIDAS: 'E-mail ou senha inválidos.',
  SEM_PERMISSAO: 'Você não tem permissão para fazer isso.',
  EMAIL_EM_USO: 'Já existe uma conta com este e-mail.',
  USUARIO_NAO_ENCONTRADO: 'Usuário não encontrado.',

  // filmes
  FILME_NAO_ENCONTRADO: 'Filme não encontrado.',
  FILME_INATIVO: 'Este filme está desativado.',
  FILME_COM_SESSOES: 'Este filme já tem sessões e não pode ser excluído. Desative-o.',

  // salas
  SALA_NAO_ENCONTRADA: 'Sala não encontrada.',
  SALA_INATIVA: 'Esta sala está desativada.',
  SALA_NOME_EM_USO: 'Já existe uma sala com este nome.',
  SALA_SEM_ASSENTOS: 'Esta sala não tem assentos cadastrados.',
  SALA_COM_SESSOES_FUTURAS: 'A sala tem sessões agendadas; o layout não pode ser alterado agora.',
  SALA_COM_HISTORICO: 'A sala já teve sessões. Para outro layout, crie uma nova sala.',
  ASSENTO_FORA_DO_LAYOUT: 'Há assentos PCD/VIP fora do layout informado.',
  ASSENTO_TIPO_CONFLITANTE: 'Um assento não pode ser PCD e VIP ao mesmo tempo.',

  // sessões
  SESSAO_NAO_ENCONTRADA: 'Sessão não encontrada.',
  SESSAO_NO_PASSADO: 'Escolha uma data e hora no futuro.',
  SESSAO_SOBREPOSTA: 'Já existe uma sessão nessa sala nesse horário (contando o intervalo de limpeza).',
  SESSAO_CANCELADA: 'Esta sessão foi cancelada.',
  SESSAO_ENCERRADA: 'Esta sessão já começou; não é mais possível reservar.',
  SESSAO_JA_CANCELADA: 'Esta sessão já está cancelada.',
  SESSAO_COM_INGRESSOS: 'A sessão já tem ingressos vendidos e não pode ser cancelada.',

  // reservas
  ASSENTO_INDISPONIVEL: 'Ops! Alguém acabou de escolher um desses assentos.',
  ASSENTO_INVALIDO: 'Um ou mais assentos não pertencem a esta sessão.',
  RESERVA_NAO_ENCONTRADA: 'Reserva não encontrada.',
  RESERVA_PENDENTE_EXISTENTE: 'Você já tem uma reserva pendente nesta sessão. Pague ou cancele antes de fazer outra.',
  RESERVA_NAO_PENDENTE: 'Esta reserva não está mais pendente.',

  // pagamento e ingressos (B06)
  RESERVA_EXPIRADA: 'O tempo da sua reserva acabou. Escolha os assentos novamente.',
  RESERVA_JA_PAGA: 'Esta reserva já foi paga.',
  INGRESSO_NAO_ENCONTRADO: 'Ingresso inválido.',
  INGRESSO_JA_UTILIZADO: 'Este ingresso já foi utilizado.',
  INGRESSO_FORA_DO_HORARIO: 'Fora do horário da sessão.',
};

export const MENSAGEM_SEM_CONEXAO = 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.';
export const MENSAGEM_TEMPO_ESGOTADO = 'O servidor demorou para responder. Tente novamente.';
export const MENSAGEM_GENERICA = 'Algo deu errado. Tente novamente em instantes.';
