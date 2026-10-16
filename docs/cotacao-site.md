# "Solicitar cotação": como a LP leva à cotação do Timberland no site

A LP não tem formulário de cotação. Todos os botões "Solicitar cotação" levam a:

`https://www.belgotex.com.br/produtos/pisos-vinilicos-lvt/timberland?utm_source=lp-timberland&utm_medium=landing-page&utm_campaign=lp-timberland-spc&utm_content=<botão>#cotacao`

O site já abre o modal de cotação quando o endereço termina em `#cotacao` (função `openQuoteModalFromHash`).
**Mas, aberto assim, o modal vem vazio**: o Timberland só entra já selecionado quando a pessoa clica no botão
"Cotação" da própria página (`.popup-with-form[data-product-id="106"]`, que chama `addProductToQuote`).

## Ajuste sugerido no site (para o desenvolvedor da Belgotex)

Em `openQuoteModalFromHash`, se a página tiver o botão de cotação de um produto, clicar nele em vez de abrir o
modal genérico. Assim o modal abre com o produto já selecionado, igual ao clique na página:

```js
function openQuoteModalFromHash() {
  if (!['#quoteModal', '#orcamento', '#cotacao'].includes(window.location.hash)) {
    return;
  }

  // Na página de um produto: abre a cotação já com o produto (mesmo caminho do botão "Cotação")
  const productButton = document.querySelector('.popup-with-form[data-product-id]');

  const open = () => {
    if (!window.$?.magnificPopup) {
      return false;
    }
    if (productButton) {
      productButton.click();
    } else {
      window.$.magnificPopup.open({ items: { src: '#quoteModal' }, type: 'inline' });
    }
    return true;
  };

  // ... o restante da função (tentativas a cada 150 ms) continua igual
}
```

O mesmo ajuste serve para as próximas LPs (Explore etc.): basta apontar para a página do produto com `#cotacao`.
