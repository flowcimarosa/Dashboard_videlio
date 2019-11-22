const anneeEncours = moment().format('YYYY');
const typeTickets = {};
/** ******************************************* Affichage Bandeau Haut  ****************************************** */
/** ************************************************************************************************************** */
const pageTitle = `${anneeEncours} - Stats Tickets par Type`;
$(document).prop('title', pageTitle);
$('#pageTitle').html(pageTitle);
$('#gaucheTexte').html('');
$('#droiteTexte').html('');

/** *****************************Variables Graphiques****************************** */
const chartColors = {
  Critique: '#bf1313',
  Haute: '#FF6D00',
  Moyenne: '#F7DF16',
  Faible: '#33691E',
  Clotures: '#d51366'
};

const effectColors = {
  highlight: 'rgba(108, 117, 125, 0.5)',
  shadow: 'rgba(0, 0, 0, 1)',
  glow: '#000000'
};

/*********************************************************
 * Fonction Génération Tableau Service
 *********************************************************/

async function getTicketsOpenCountByType() {
  typeTickets.encours = [];
  typeTickets.totaux = [];
  typeTickets.labels = [];
  let numberTotal = 0;
  const list = await fetch(
    `http://10.1.2.7:3100/requests/ticketscounts/0/0/total/0/0/type`
  )
    .then(response => {
      return response.json();
    })
    .catch(error => {
      return `ListTicketsCounts request error : ${error}`;
    });
  list.forEach(number => {
    if (number.Type === '') {
      number.Type = 'Non renseigné';
    }
    typeTickets.encours.push(number);
    numberTotal += number.nombre;
  });
  typeTickets.totaux.push({ type: 'encours', nombre: numberTotal });
  return typeTickets;
}

async function getTicketsClosedCountByType(typeTickets) {
  typeTickets.clotures = [];
  let numberTotal = 0;
  const list = await fetch(
    `http://10.1.2.7:3100/requests/ticketscounts/1/${anneeEncours}/total/0/0/type`
  )
    .then(response => {
      return response.json();
    })
    .catch(error => {
      return `ListTicketsCountsClosed request error : ${error}`;
    });
  list
    .sort(function(a, b) {
      return a.nombre - b.nombre;
    })
    .reverse();
  list.forEach(number => {
    if (number.Type === '') {
      number.Type = 'Non renseigné';
    }
    typeTickets.clotures.push(number);
    numberTotal += number.nombre;
  });
  typeTickets.totaux.push({ type: 'clotures', nombre: numberTotal });
  return typeTickets;
}

async function incidentsListbyPriority(typeTickets) {
  typeTickets.priorite = [];
  let numberTotal = 0;
  const list = await fetch(
    `http://10.1.2.7:3100/requests/ticketscounts/0/0/total/0/0/incident`
  )
    .then(response => {
      return response.json();
    })
    .catch(error => {
      return `ListTicketsCountsIncident request error : ${error}`;
    });
  list.forEach(number => {
    numberTotal += number.nombre;
  });
  return typeTickets;
}

async function setLabel(typeTickets) {
  typeTickets.clotures.forEach(ticket => {
    typeTickets.labels.push(ticket.Type);
  });
  typeTickets.encours.forEach(ticket => {
    typeTickets.labels.push(ticket.Type);
  });

  typeTickets.labels = [...new Set(typeTickets.labels)];
  return typeTickets;
}

async function getTicketsList(typeTickets) {
  typeTickets.ticketsClotures = {};
  typeTickets.prioriteCritique = {};
  typeTickets.prioriteHaute = {};
  typeTickets.prioriteMoyenne = {};
  typeTickets.prioriteFaible = {};
  typeTickets.ticketsClotures.label = 'Clotures';
  typeTickets.prioriteCritique.label = 'Critique';
  typeTickets.prioriteHaute.label = 'Haute';
  typeTickets.prioriteMoyenne.label = 'Moyenne';
  typeTickets.prioriteFaible.label = 'Faible';
  const ticketsClotures = [];
  const prioriteCritique = [];
  const prioriteHaute = [];
  const prioriteMoyenne = [];
  const prioriteFaible = [];
  const list = await fetch(
    `http://10.1.2.7:3100/requests/ticketsList/0/0/total/0/0`
  )
    .then(response => {
      return response.json();
    })
    .catch(error => {
      return `ListTicketsList request error : ${error}`;
    });

  typeTickets.labels.forEach(element => {
    ticketsClotures.push(0);
  });

  typeTickets.labels.forEach(label => {
    typeTickets.clotures.forEach(type => {
      if (type.Type === label) {
        ticketsClotures[typeTickets.labels.indexOf(label)] = type.nombre;
      }
    });
  });

  typeTickets.labels.forEach(label => {
    prioriteCritique.push(
      list.filter(obj => {
        if (label == obj.Type) {
          return obj.Priority === 'Critique';
        }
      }).length
    );
    prioriteHaute.push(
      list.filter(obj => {
        if (label == obj.Type) {
          return obj.Priority === 'Haute';
        }
      }).length
    );
    prioriteMoyenne.push(
      list.filter(obj => {
        if (label == obj.Type) {
          return obj.Priority === 'Moyenne';
        }
      }).length
    );
    prioriteFaible.push(
      list.filter(obj => {
        if (label == obj.Type) {
          return (
            obj.Priority === 'Moyenne' ||
            obj.Priority === '' ||
            obj.Priority === 'Audiovisuel'
          );
        }
      }).length
    );
  });
  typeTickets.ticketsClotures.values = ticketsClotures;
  typeTickets.prioriteCritique.values = prioriteCritique;
  typeTickets.prioriteHaute.values = prioriteHaute;
  typeTickets.prioriteMoyenne.values = prioriteMoyenne;
  typeTickets.prioriteFaible.values = prioriteFaible;
  return typeTickets;
}

/** ************************* Création Charts top 20  ******************** */
async function setCharts(typeTickets) {
  const dataSetsenCours = [
    typeTickets.prioriteFaible,
    typeTickets.prioriteMoyenne,
    typeTickets.prioriteHaute,
    typeTickets.prioriteCritique,
    typeTickets.ticketsClotures
  ];

  /**
   * TODO CSS responsive à faire

   */
  const chartHeight = window.innerHeight * 0.02;
  const configCharts = {
    type: 'horizontalBar',
    data: {
      labels: typeTickets.labels,
      datasets: []
    },
    options: {
      title: {
        display: false,
        text: ''
      },
      maintainAspectRatio: false,
      layout: {
        padding: {
          left: 0,
          right: 0,
          top: 0,
          bottom: chartHeight
        }
      },
      responsive: true,
      scales: {
        xAxes: [
          {
            stacked: true,
            type: 'linear',
            id: 'open',
            position: 'bottom',
            ticks: {
              fontStyle: 'bold'
            }
          },
          {
            stacked: true,
            type: 'linear',
            id: 'closed',
            position: 'top',
            gridLines: {
              drawOnChartArea: false
            },
            ticks: {
              fontColor: '#d51366',
              fontStyle: 'bold'
            }
          }
        ],
        yAxes: [
          {
            stacked: true,
            ticks: {
              fontStyle: 'bold',
              fontSize: '16',
              padding: 25
            }
          }
        ]
      },

      legend: {
        display: false
      },
      showAllTooltips: true,
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
  const ownerChart = document.getElementById('typeTickets').getContext('2d');
  window.typeTicketsStats = new Chart(ownerChart, configCharts);
  dataSetsenCours.forEach(data => {
    const newDataset = {
      backgroundColor: chartColors[data.label],
      borderWidth: 0,
      data: data.values,
      label: data.label,
      stack: 'Stack0',
      xAxisID: 'open',
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
    if (data.label === 'Clotures') {
      newDataset.stack = 'Stack1';
      newDataset.xAxisID = 'closed';
    }
    configCharts.data.datasets.push(newDataset);
    window.typeTicketsStats.update();
  });
}

const PriorityLegende = document.getElementById('gaucheTexte');
PriorityLegende.insertAdjacentHTML(
  'beforeend',
  `  <p>
  En cours
        <button
          class="btn btn-secondary"
          style="background:${chartColors.Faible}"
        >
          Faible
        </button>
        <button
          class="btn btn-secondary"
          style="background:${chartColors.Moyenne}"
        >
          Moyenne
        </button>
        <button
          class="btn btn-secondary"
          style="background:${chartColors.Haute}"
        >
          Haute
        </button>        <button
          class="btn btn-secondary"
          style="background:${chartColors.Critique}"
        >
          Critique
        </button>
      </p>`
);
const closedLegende = document.getElementById('droiteTexte');
closedLegende.insertAdjacentHTML(
  'beforeend',
  `  <p>
          <button
          class="btn btn-secondary"
          style="background:${chartColors.Clotures}"
        >
          Cloturés
        </button>
      </p>`
);
getTicketsOpenCountByType()
  .then(result => getTicketsClosedCountByType(result))
  .then(result => incidentsListbyPriority(result))
  .then(result => setLabel(result))
  .then(result => getTicketsList(result))
  .then(result => setCharts(result));

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
