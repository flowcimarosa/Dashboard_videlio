const anneeEncours = moment().format('YYYY');
/** ******************************************* Affichage Bandeau Haut  ****************************************** */
/** ************************************************************************************************************** */
const pageTitle = `${anneeEncours} - Top 20`;
$(document).prop('title', pageTitle);
$('#pageTitle').html(pageTitle);
$('#gaucheTexte').html('');
$('#droiteTexte').html('');

/** *****************************Variables Graphiques****************************** */
const chartColors = {
  closedTickets: '#33691e',
  gtrCounts: '#0082C3',
  openTickets: '#d51366'
};

const effectColors = {
  highlight: 'rgba(108, 117, 125, 0.5)',
  shadow: 'rgba(0, 0, 0, 1)',
  glow: '#000000'
};

/** ************************* Récupération List owner  ******************** */
async function getListofUser() {
  const list = await fetch(`http://10.1.2.7:3100/requests/ListOwnerName`)
    .then(response => {
      return response.json();
    })
    .catch(error => {
      return `ListOwnerName request error : ${error}`;
    });
  return list;
}

/** ************************* Création List top 20  ******************** */

async function setListTop20(list) {
  const statsTickets = await fetch(
    `http://10.1.2.7:3100/requests/ticketscounts/1/${anneeEncours}/total/0/0/owner`
  )
    .then(response => {
      return response.json();
    })
    .catch(error => {
      return `ticketscounts group by owner request error : ${error}`;
    });
  let top20 = statsTickets.sort((a, b) => a.nombre - b.nombre).reverse();
  top20.forEach((top, index, top20) => {
    list.forEach(owner => {
      if (top.OwnerId == owner.OwnerId) {
        top.ownerName = owner.OwnerName;
      }
    });
  });
  top20.reduceRight((acc, item, index, object) => {
    if (!item.ownerName) {
      object.splice(index, 1);
    }
  }, []);
  listTop20 = top20.slice(0, 20);
  return listTop20;
}
/** ************************* Récupération GTR top 20  ******************** */
async function getGtrByOwner(listTop20) {
  const gtr = async () => {
    for (let top of listTop20) {
      await fetch(
        `http://10.1.2.7:3100/requests/gtrcounts/1/${anneeEncours}/total/${top.OwnerId}/0/0`
      )
        .then(response => {
          response.json().then(json => {
            top.gtr = json[0].nombre.toFixed(1);
          });
        })
        .catch(error => {
          return `ListOwnerName request error : ${error}`;
        });
    }
    return listTop20;
  };
  return gtr();
}

/** ************************* Création Charts top 20  ******************** */
async function setCharts(listTop20) {
  let ownersName = [];
  let gtrs = [];
  let listClotures = [];
  listTop20.forEach(top => {
    gtrs.push(top.gtr);
    ownersName.push(top.ownerName);
    listClotures.push(top.nombre);
  });

  const gtr = {
    label: 'gtrCounts',
    value: [...gtrs]
  };

  const clotures = {
    label: 'closedTickets',
    value: [...listClotures]
  };

  const dataSets = [gtr, clotures];
  /**
   * TODO CSS responsive à faire
   */
  const chartHeight = window.innerHeight * 0.02;
  console.log('TCL: setCharts -> chartHeight', chartHeight);
  const configCharts = {
    type: 'horizontalBar',
    data: {
      labels: ownersName,
      datasets: []
    },
    options: {
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 0,
          bottom: chartHeight
        }
      },
      title: {
        display: false,
        text: ''
      },
      scales: {
        yAxes: [
          {
            ticks: {
              weight: 5,
              fontSize: 18,
              fontStyle: 'bold'
            }
          }
        ]
      },
      legend: {
        display: false
      },
      showAllTooltips: true,
      plugins: {
        datalabels: {
          align: 'end',
          anchor: 'end',
          backgroundColor: function(context) {
            return context.dataset.backgroundColor;
          },
          borderRadius: 4,
          color: 'white',
          formatter: Math.round
        }
      },
      tooltips: {
        mode: 'label',
        intersect: false,
        backgroundColor: '',
        titleFontSize: 18,
        bodyFontSize: 18,
        shadowOffsetX: 3,
        shadowOffsetY: 3,
        shadowBlur: 10,
        shadowColor: effectColors.shadow,
        bevelWidth: 2,
        bevelHighlightColor: effectColors.highlight,
        bevelShadowColor: effectColors.shadow
      },
      hover: {
        mode: 'index',
        intersect: false
      }
    }
  };
  const ownerChart = document.getElementById('TOP20').getContext('2d');
  window.TicketsClotures = new Chart(ownerChart, configCharts);
  dataSets.forEach(data => {
    const newDataset = {
      backgroundColor: chartColors[data.label],
      borderWidth: 0,
      data: data.value,
      shadowOffsetX: 3,
      shadowOffsetY: 3,
      shadowBlur: 10,
      shadowColor: effectColors.shadow,
      bevelWidth: 2,
      bevelHighlightColor: effectColors.highlight,
      bevelShadowColor: effectColors.shadow,
      hoverInnerGlowWidth: 20,
      hoverInnerGlowColor: effectColors.glow,
      hoverOuterGlowWidth: 20,
      hoverOuterGlowColor: effectColors.glow
    };
    configCharts.data.datasets.push(newDataset);
    window.TicketsClotures.update();
  });
}
const TitleLegende = document.getElementById('droiteTexte');
TitleLegende.insertAdjacentHTML(
  'beforeend',
  `  <p>
        <button
          class="btn btn-secondary"
          style="background:${chartColors.closedTickets}"
        >
          Cloturés
        </button>
        <button
          class="btn btn-secondary"
          style="background:${chartColors.gtrCounts}"
        >
          GTR
        </button>
      </p>`
);

getListofUser()
  .then(result => setListTop20(result))
  .then(result => getGtrByOwner(result))
  .then(result => setCharts(result));
/*
  .then(result => scroll());
*/
// Date d'aujourd'hui
$(document).ready(function() {
  setInterval(function() {
    const date = moment().format('DD[/]MM[/]YYYY [|] HH[:]mm[:]ss');
    $('div.dateDiv a').html(date);
  }, 1000);
});

function getUrlVars() {
  const vars = [];
  let hash = '';
  const hashes = window.location.href
    .slice(window.location.href.indexOf('?') + 1)
    .split('&');
  for (let i = 0; i < hashes.length; i += 1) {
    hash = hashes[i].split('=');
    vars.push(hash[0]);
    vars[hash[0]] = hash[1];
  }
  return vars;
}
