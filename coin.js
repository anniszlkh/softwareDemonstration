const ctx2 = document.getElementById('cryptoChart').getContext('2d');
let cryptoChart;

async function updateCrypto() {
  const coin = document.getElementById('coinInput').value.toLowerCase();
  const res = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coin}`
  );
  const data = await res.json();
  if (!data.length) return alert('Coin not found');

  const config = {
    type: 'bar',
    data: {
      labels: [data[0].name],
      datasets: [{
        label: 'Price (USD)',
        data: [data[0].current_price],
      }]
    }
  };

  if (cryptoChart) cryptoChart.destroy();
  cryptoChart = new Chart(ctx2, config);
}

document.getElementById('searchBtn').addEventListener('click', updateCrypto);

