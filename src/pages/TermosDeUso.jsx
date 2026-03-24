import React from "react";

export default function TermosDeUso() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-8 md:p-12">
        <h1 className="text-3xl font-black text-gray-900 mb-2">TERMO DE PRIVACIDADE</h1>
        <h2 className="text-xl font-bold text-gray-700 mb-1">PETIÇÃO BR</h2>
        <p className="text-sm text-gray-500 mb-8">Última atualização: 23 de março de 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">1. SOBRE A PLATAFORMA</h3>
            <p>A Petição BR é uma plataforma digital destinada à coleta de manifestações de apoio a causas, propostas, demandas públicas ou privadas, por meio de abaixo-assinados eletrônicos.</p>
            <p className="mt-2">A plataforma atua exclusivamente como intermediadora tecnológica, não sendo responsável pelo conteúdo das petições criadas por terceiros.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">2. ACEITAÇÃO DOS TERMOS</h3>
            <p>Ao utilizar a plataforma Petição BR e fornecer seus dados, o usuário declara que:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Leu e compreendeu este Termo;</li>
              <li>Concorda com a coleta e uso de seus dados;</li>
              <li>Está ciente das responsabilidades legais decorrentes de suas declarações.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">3. DADOS COLETADOS</h3>
            <p>Poderão ser coletados os seguintes dados pessoais:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nome completo</li>
              <li>CPF</li>
              <li>Telefone</li>
              <li>E-mail</li>
            </ul>
            <p className="mt-2">Esses dados são fornecidos diretamente pelo usuário no momento da assinatura.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">4. FINALIDADE DO TRATAMENTO DE DADOS</h3>
            <p>Os dados serão utilizados para:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Identificar o signatário da petição;</li>
              <li>Validar autenticidade e evitar fraudes;</li>
              <li>Compor a lista de apoiadores;</li>
              <li>Permitir contato, se necessário, sobre a petição;</li>
              <li>Atender eventuais obrigações legais ou regulatórias.</li>
            </ul>
            <p className="mt-3 font-medium">Base legal aplicável:</p>
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li>Execução de procedimentos preliminares relacionados à manifestação de vontade do titular (art. 7º, V da Lei Geral de Proteção de Dados Pessoais);</li>
              <li>Legítimo interesse (art. 7º, IX), para prevenção à fraude e segurança da plataforma.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">5. RESPONSABILIDADE DO USUÁRIO</h3>
            <p>O usuário declara que:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Os dados informados são verdadeiros e de sua titularidade;</li>
              <li>Não está utilizando dados de terceiros sem autorização;</li>
              <li>Tem ciência de que o uso indevido de dados pode configurar crime.</li>
            </ul>
            <p className="mt-2">A Petição BR poderá excluir assinaturas suspeitas ou inconsistentes.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">6. COMPARTILHAMENTO DE DADOS</h3>
            <p>Os dados poderão ser compartilhados:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Com os organizadores da petição;</li>
              <li>Com autoridades públicas, mediante requisição legal;</li>
              <li>Para cumprimento de obrigações legais ou defesa em processos.</li>
            </ul>
            <p className="mt-2">A Petição BR não comercializa dados pessoais.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">7. DIVULGAÇÃO DAS ASSINATURAS</h3>
            <p>Dependendo da configuração da petição:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Nome poderá ser exibido publicamente;</li>
              <li>Demais dados (CPF, telefone e e-mail) não serão divulgados publicamente.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">8. SEGURANÇA DA INFORMAÇÃO</h3>
            <p>A Petição BR adota medidas técnicas e administrativas para proteger os dados contra:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Acesso não autorizado;</li>
              <li>Vazamento;</li>
              <li>Alteração indevida.</li>
            </ul>
            <p className="mt-2">Apesar disso, nenhum sistema é totalmente seguro, sendo importante que o usuário também adote boas práticas.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">9. RETENÇÃO DOS DADOS</h3>
            <p>Os dados serão mantidos:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Enquanto a petição estiver ativa;</li>
              <li>Pelo período necessário para cumprimento de obrigações legais;</li>
              <li>Ou até solicitação de exclusão, quando aplicável.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">10. DIREITOS DO TITULAR</h3>
            <p>Nos termos da LGPD, o usuário pode solicitar:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Confirmação do tratamento;</li>
              <li>Acesso aos dados;</li>
              <li>Correção;</li>
              <li>Exclusão;</li>
              <li>Portabilidade;</li>
              <li>Informação sobre compartilhamentos.</li>
            </ul>
            <p className="mt-2">Solicitações devem ser feitas pelo e-mail: <a href="mailto:dpo@complysolution.com.br" className="text-blue-600 underline">dpo@complysolution.com.br</a></p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">11. LIMITAÇÃO DE RESPONSABILIDADE</h3>
            <p>A Petição BR:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Não garante que a petição terá efeitos jurídicos ou administrativos;</li>
              <li>Não se responsabiliza pelo conteúdo das petições;</li>
              <li>Não garante que assinaturas terão validade legal perante órgãos públicos.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">12. USO INDEVIDO DA PLATAFORMA</h3>
            <p>É proibido:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Inserir dados falsos;</li>
              <li>Criar petições ilícitas ou enganosas;</li>
              <li>Utilizar a plataforma para fraude, manipulação ou desinformação.</li>
            </ul>
            <p className="mt-2">Contas ou petições poderão ser removidas sem aviso prévio.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">13. ALTERAÇÕES DO TERMO</h3>
            <p>Este Termo pode ser atualizado a qualquer momento. Recomenda-se revisão periódica.</p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-gray-900 mb-2">14. CONTATO</h3>
            <p>Para dúvidas ou solicitações:</p>
            <p className="mt-2">E-mail: <a href="mailto:dpo@complysolution.com.br" className="text-blue-600 underline">dpo@complysolution.com.br</a></p>
            <p>Responsável pelo tratamento de dados (DPO): Allan Kovalscki</p>
          </section>
        </div>
      </div>
    </div>
  );
}
