const capitalref = getUrlVars().cr;
const capitalName = '';
const clientref = getUrlVars().client;
const ownerref = getUrlVars().owner;
const ownername = '';
const clientName = '';
const ticketClotures = 0;
let ticketsEnCours = 0;
const gtrYears = new Object();
const closedTicketsYears = new Object();
const today = moment().format('YYYY[-]MM[-]DD');
const team = [
  { name: 'Mourad CHARNI' },
  { name: 'Orlando PINTO' },
  { name: 'Olivier Defrance-Boisseau' },
  { name: 'Sebastien BAILLET' },
  { name: 'Brice DORE' },
  { name: 'Alexandre DONZEL' }
];

/** ******************************************* Affichage Bandeau Haut  ****************************************** */
/** ************************************************************************************************************** */
const pageTitle = 'Conciergerie - Tickets';
$(document).prop('title', pageTitle);
$('#pageTitle').html(pageTitle);
$('#gaucheTexte').html('En cours : ');
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

const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Aout',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre'
];

/** ************************* Récupération Id Menbre Conciergerie ******************** */
const getListofUser = fetch(`http://10.1.2.7:3100/requests/ListOwnerName`).then(
  response => {
    return response.json();
  }
);

const setIdOfUser = list => {
  const teamUpdated = [];
  Object.values(team).forEach(member => {
    Object.values(list).forEach(user => {
      if (user.OwnerName === member.name) {
        teamUpdated.push({ id: user.OwnerId, name: member.name });
      }
    });
  });
  return teamUpdated;
};

const getOpenTicketsbyOwner = teamUpdated => {
  const updateTeam = [];
  teamUpdated.forEach(member => {
    updateTeam.push(
      fetch(
        `http://10.1.2.7:3100/requests/ticketscounts/0/0/total/${member.id}/0/mois`
      )
        .then(response => response.json())
        .then(json => {
          member.encours = 0;
          member.openTickets = {};
          json.forEach(comptes => {
            if (!member.openTickets[comptes.year]) {
              member.openTickets[comptes.year] = {
                valeurs: new Array(12),
                periode: 0
              };
              member.openTickets[comptes.year].valeurs.fill(0, 0, 12);
            }
            periode = 0;
            if (comptes.month > periode) {
              member.openTickets[comptes.year].periode = comptes.month;
            }
            member.openTickets[comptes.year].valeurs[comptes.month - 1] =
              comptes.nombre;
            ticketsEnCours += comptes.nombre;

            member.encours += comptes.nombre;
          });
          $('#EnCours').html(ticketsEnCours);
        })
    );
  });
  return Promise.all(updateTeam).then(() => {
    return teamUpdated;
  });
};

const getClosedTicketsbyOwner = teamUpdated => {
  const year = moment().format('YYYY');
  const month = moment().format('M');
  const updateTeam = [];
  teamUpdated.forEach(member => {
    updateTeam.push(
      fetch(
        `http://10.1.2.7:3100/requests/ticketscounts/1/0/total/${member.id}/0/mois`
      )
        .then(response => response.json())
        .then(json => {
          member.closedTickets = {};
          json.forEach(comptes => {
            if (!member.closedTickets[comptes.year]) {
              member.closedTickets[comptes.year] = {
                valeurs: new Array(12),
                periode: 0
              };
              member.closedTickets[comptes.year].valeurs.fill(0, 0, 12);
            }
            periode = 0;
            if (comptes.month > periode) {
              member.closedTickets[comptes.year].periode = comptes.month;
            }
            member.closedTickets[comptes.year].valeurs[comptes.month - 1] =
              comptes.nombre;
            if (comptes.year == year && comptes.month == month) {
              member.cloturesMois = comptes.nombre;
            } else {
              member.cloturesMois = 0;
            }
          });
        })
    );
  });
  return Promise.all(updateTeam).then(() => {
    console.log(teamUpdated);
    return teamUpdated;
  });
};

const getGtrbyOwner = teamUpdated => {
  const updateTeam = [];
  teamUpdated.forEach(member => {
    updateTeam.push(
      fetch(
        `http://10.1.2.7:3100/requests/gtrcounts/1/0/total/${member.id}/0/mois`
      )
        .then(response => response.json())
        .then(json => {
          member.gtrCounts = {};

          json.forEach(comptes => {
            if (!member.gtrCounts[comptes.year]) {
              member.gtrCounts[comptes.year] = {
                valeurs: new Array(12),
                periode: 0
              };
              member.gtrCounts[comptes.year].valeurs.fill(0, 0, 12);
            }
            periode = 0;
            if (comptes.month > periode) {
              member.gtrCounts[comptes.year].periode = comptes.month;
            }
            if (comptes.nombre < 0) {
              member.gtrCounts[comptes.year].valeurs[comptes.month - 1] = 0;
            } else {
              member.gtrCounts[comptes.year].valeurs[
                comptes.month - 1
              ] = comptes.nombre.toFixed(1);
            }
          });
        })
    );
  });
  return Promise.all(updateTeam).then(() => {
    return teamUpdated;
  });
};

const setOwnerCharts = teamUpdated => {
  teamUpdated.forEach(member => {
    const year = moment().format('YYYY');
    const month = moment().format('M');
    let moisTxt = moment()
      .locale('fr')
      .format('MMMM');
    let urgents = 0;
    /** Perdiode 12 mois glissants  */
    let monthsBefore = [...MONTHS];
    monthsBefore = monthsBefore
      .slice(month, monthsBefore.length)
      .map(mois => `${mois} - ${year - 1}`);
    const periodeMonths = MONTHS.slice(0, month).map(
      mois => `${mois} - ${year}`
    );
    const chartPeriode = [...monthsBefore, ...periodeMonths];

    /** Valeurs 12 mois glissants Tickets ouverts */
    let openBefore = '';
    let openPeriode = '';
    if (!member.openTickets[year]) {
      openPeriode = new Array(12 - month);
      openPeriode.fill(0, 0, 12 - month);
    } else {
      openPeriode = [...member.openTickets[year].valeurs];
      openPeriode = openPeriode.slice(0, month);
    }
    if (!member.openTickets[year - 1]) {
      openBefore = new Array(12 - month);
      openBefore.fill(0, 0, 12 - month);
    } else {
      openBefore = [...member.openTickets[year - 1].valeurs];
      openBefore = openBefore.slice(month, openBefore.length);
    }
    const openValue = [...openBefore, ...openPeriode];
    const open = {
      label: 'openTickets',
      value: [...openBefore, ...openPeriode]
    };

    /** Valeurs 12 mois glissants Tickets Cloturés */
    let closedBefore = '';
    let closedPeriode = [...member.closedTickets[year].valeurs];
    closedPeriode = closedPeriode.slice(0, month);
    if (!member.closedTickets[year - 1]) {
      closedBefore = new Array(12 - month);
      closedBefore.fill(0, 0, 12 - month);
    } else {
      closedBefore = [...member.closedTickets[year - 1].valeurs];
      closedBefore = closedBefore.slice(month, closedBefore.length);
    }
    const closedValue = [...closedBefore, ...closedPeriode];
    const closed = {
      label: 'closedTickets',
      value: [...closedBefore, ...closedPeriode]
    };

    /** Valeurs 12 mois glissants GTR  */
    /*  let gtrBefore = '';
    let gtrPeriode = [...member.gtrCounts[year].valeurs];
    gtrPeriode = gtrPeriode.slice(0, month);
    if (!member.gtrCounts[year - 1]) {
      gtrBefore = new Array(12 - month);
      gtrBefore.fill(0, 0, 12 - month);
    } else {
      gtrBefore = [...member.gtrCounts[year - 1].valeurs];
      gtrBefore = gtrBefore.slice(month, gtrBefore.length);
    }
    const gtr = {
      label: 'gtrCounts',
      value: [...gtrBefore, ...gtrPeriode]
    };*/

    const datas = [open, closed];
    /** Récupération tickets ouverts depuis plus d'un an  */
    for (let [key, value] of Object.entries(member.openTickets)) {
      if (Object.entries(member.openTickets) < year) {
        if (key == year - 1) {
          urgentsBefore = [...value.valeurs];
          urgentsBefore = urgentsBefore.slice(0, month);
          urgents = urgentsBefore.reduce(
            (accumulator, currentValue) => accumulator + currentValue
          );
        } else {
          urgentsBefore = [...value.valeurs];
          urgents = urgentsBefore.reduce(
            (accumulator, currentValue) => accumulator + currentValue
          );
        }
      }
    }
    const Charts = document.getElementById('charts');
    /**
     * TODO CSS responsive à faire
     */
    Charts.insertAdjacentHTML(
      'beforeend',
      `<div class="col-xl-6">
      <div class="card">
        <div class="row justify-content-around">
        <div class="col-xl-3"></div>
          <div class="col-xl-6"><h3 class="card-title justify-content-center">${
            member.name
          }</h3></div>
          <div class="col-xl-3">
          <div class="card-title float-right">
          <h3 style="color:#D51366;font-weight:bold;">${member.encours}</h3>
          </div>
          </div>
          <div class="row justify-content-center">
          <div class="card-title float-right">
          <h5><a style="font-weight:bold;">Tickets cloturés en ${moisTxt} : </a><a style="color:#33691E;font-weight:bold;">${
        member.cloturesMois
      }</a></h5>
          </div>
          </div>
          ${
            urgents > 0
              ? '<h5 class="card-title row justify-content-center" style="color:red;font-weight:bold;">Tickets Supérieurs à 1 an : ' +
                urgents +
                '</h5>'
              : ''
          }
        </div>
        <div class="card-body row  justify-content-center">
            <canvas class="col-xl-12" id="${member.id}"></canvas>
        </div>
    </div>
    </div>`
    );
    const configCharts = {
      type: 'horizontalBar',
      data: {
        labels: chartPeriode,
        datasets: []
      },
      options: {
        //aspectRatio: 4 / 3,
        title: {
          display: false,
          text: ''
        },
        scales: {
          yAxes: [
            {
              categoryPercentage: 1,
              barPercentage: 1,
              gridLines: {
                offsetGridLines: true
              }
            }
          ]
        },
        legend: {
          display: false
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
    const ownerChart = document.getElementById(member.id).getContext('2d');
    window.TicketsClotures = new Chart(ownerChart, configCharts);

    datas.forEach(data => {
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
  });
};

const scroll = () => {
  setInterval(function() {
    setTimeout(function() {
      $('html, body').animate({ scrollTop: $(document).height() }, 45000);
    }, 1000);
    setTimeout(function() {
      $('html, body').animate({ scrollTop: 0 }, 45000);
    }, 1000);
  }, 1000);
};

const TitleLegende = document.getElementById('droiteTexte');
TitleLegende.insertAdjacentHTML(
  'beforeend',
  `  <p>
        <button
          class="btn btn-secondary"
          style="background:${chartColors.openTickets}"
        >
          En cours
        </button>
        <button
          class="btn btn-secondary"
          style="background:${chartColors.closedTickets}"
        >
          Cloturés
        </button>
      </p>`
);

getListofUser
  .then(result => setIdOfUser(result))
  .then(result => getOpenTicketsbyOwner(result))
  .then(result => getClosedTicketsbyOwner(result))
  .then(result => setOwnerCharts(result))
  .then(result => scroll());

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
