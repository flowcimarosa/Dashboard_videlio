let capitalref = getUrlVars()['cr'];
let capitalName = '';
const skillsList = [];
const topicsList = [];
const programsList = [];
let yearSelected = [];
let years = [];
let tableList = [];
let numberHoursPeriod = 0;
let numberCertificationPeriod = 0;
let numberSessionPeriod = 0;
let list = [];
let val = '';
const today = moment().format('YYYY[-]MM[-]DD');
const anneeEncours = moment().format('YYYY');
const apiRoute = 'https://app.360learning.com/api/v1';
const apiCompany = 'company=5be04bba08f48114ff45570e';
const apiKey = 'apiKey=574591a0343c4c6cb319958db449edc4';
/** ******************************************* Affichage Bandeau Haut  ****************************************** */
/** ************************************************************************************************************** */
let pageTitle = `Liste des formations`;
$(document).prop('title', pageTitle);
$('#pageTitle').html(pageTitle);
$('#gaucheTexte').html('');
$('#droiteTexte').html('');

async function getTopicsList() {
  await fetch(`${apiRoute}/topics?${apiCompany}&${apiKey}`).then(response =>
    response.json().then(json => {
      for (let index = 0; index < json.length; index++) {
        topicsList.push(json[index]);
      }
    })
  );
  return topicsList;
}
async function getSkillsList() {
  await fetch(`${apiRoute}/skills?${apiCompany}&${apiKey}`).then(response =>
    response.json().then(json => {
      for (let index = 0; index < json.length; index++) {
        skillsList.push(json[index]);
      }
    })
  );
  return skillsList;
}

async function getTemplatesList() {
  await fetch(`${apiRoute}/programs/templates?${apiCompany}&${apiKey}`).then(
    response =>
      response.json().then(json => {
        for (let index = 0; index < json.length; index++) {
          let programTemplate = {};
          programTemplate.statsByYear = {};
          programTemplate.programSession = [];
          programTemplate.id = json[index]._id;
          programTemplate.name = json[index].name;
          programTemplate.skills = [];
          for (let skill = 0; skill < json[index].skills.length; skill++) {
            let tempSkill = {};
            tempSkill.id = json[index].skills[skill];
            for (
              let skillName = 0;
              skillName < skillsList.length;
              skillName++
            ) {
              if (json[index].skills[skill] == skillsList[skillName]._id) {
                tempSkill.name = skillsList[skillName].name;
              }
            }
            programTemplate.skills.push(tempSkill);
          }
          programTemplate.topics = [];
          for (let topic = 0; topic < json[index].topics.length; topic++) {
            let tempTopic = {};
            tempTopic.id = json[index].topics[topic];
            for (
              let topicName = 0;
              topicName < topicsList.length;
              topicName++
            ) {
              if (json[index].topics[topic] == topicsList[topicName]._id) {
                tempTopic.name = topicsList[topicName].name;
              }
            }
            programTemplate.topics.push(tempTopic);
          }
          programTemplate.certifications = [];
          for (
            let certification = 0;
            certification < json[index].elements.length;
            certification++
          ) {
            if (
              json[index].elements[certification].type == 'certificationPDF'
            ) {
              programTemplate.certifications.push({
                name: json[index].elements[certification].title
              });
            }
          }
          if (programTemplate.certifications.length == 0) {
            programTemplate.certifications.push({
              name: 'Pas de Certification'
            });
          }
          programsList.push(programTemplate);
        }
      })
  );
  return programsList;
}

async function getSessionsList(program) {
  await fetch(`${apiRoute}/programs/sessions?${apiCompany}&${apiKey}`).then(
    response =>
      response.json().then(json => {
        for (let index = 0; index < json.length; index++) {
          if (json[index].programTemplate == program.id) {
            let sessionYear = moment(json[index].startDate).get('year');
            if (!years.includes(sessionYear)) {
              years.push(sessionYear);
            }
            if (!program.statsByYear[sessionYear]) {
              program.statsByYear[sessionYear] = {
                sessionNumber: 0,
                globalTime: 0,
                usersEngagedNumber: 0,
                usersCompletedNumber: 0,
                certificationPassed: 0,
                certificationFailed: 0,
                certificationPending: 0,
                certificationAttemps: 0,
                averageScore: 0,
                averageDuration: 0
              };
            }
            let session = {
              tutors: []
            };
            session.year = sessionYear;
            program.statsByYear[sessionYear].sessionNumber += 1;
            session.id = json[index]._id;
            session.name = json[index].name;
            session.startDate = json[index].startDate;
            session.endDate = json[index].endDate;
            session.programDuration = json[index].programDuration;
            json[index].tutors.forEach(tutor => {
              session.tutors.push(tutor);
            });
            program.programSession.push(session);
          }
        }
      })
  );
  return program;
}
const getUsersList = async session => {
  const users = await fetch(
    `${apiRoute}/programs/sessions/${session.id}/users?${apiCompany}&${apiKey}`
  ).then(response => response.json());

  return users;
};

const getStatsByUser = async (session, user) => {
  const stats = await fetch(
    `${apiRoute}/programs/sessions/${session.id}/stats/${user.mail}?${apiCompany}&${apiKey}`
  ).then(stats => stats.json());
  return stats;
};

const ProgramsList = async _ => {
  let skills = await getSkillsList();
  let topics = await getTopicsList();
  let programs = await getTemplatesList();
  for (let index = 0; index < programs.length; index++) {
      let program = await getSessionsList(programs[index]);
      for (
        let sessionId = 0;
        sessionId < program.programSession.length;
        sessionId++
      ) {
        const session = program.programSession[sessionId];
        program.programSession[sessionId].users = [];
        let sessionYear = moment(session.startDate).get('year');
        const users = await getUsersList(session);
        for (let user = 0; user < users.length; user++) {
          const stats = await getStatsByUser(session, users[user]);
          program.statsByYear[sessionYear].usersEngagedNumber += 1;
          program.statsByYear[sessionYear].globalTime +=
            stats.globalTime / 1000 / 60;
          if (stats.progress == 100) {
            program.statsByYear[sessionYear].usersCompletedNumber += 1;
            stats.score = stats.score ? stats.score : 0;
            if (program.statsByYear[sessionYear].usersCompletedNumber == 1) {
              program.statsByYear[sessionYear].averageScore = stats.score;
              program.statsByYear[sessionYear].averageDuration =
                stats.globalTime / 1000 / 60;
            } else {
              program.statsByYear[sessionYear].averageScore =
                (program.statsByYear[sessionYear].averageScore + stats.score) / 2;
              program.statsByYear[sessionYear].averageDuration =
                (program.statsByYear[sessionYear].averageDuration +
                  stats.globalTime / 1000 / 60) /
                2;
            }
          }
          if (program.certifications[0].name == 'Pas de Certification') {
            program.statsByYear[sessionYear].certificationPassed = 'N/A';
            program.statsByYear[sessionYear].certificationFailed = 'N/A';
            program.statsByYear[sessionYear].certificationPending = 'N/A';
            program.statsByYear[sessionYear].certificationAttemps = 'N/A';
          } else {
            for (
              let certification = 0;
              certification < stats.certifications.length;
              certification++
            ) {
              program.statsByYear[sessionYear].certificationAttemps += 1;
              if (stats.certifications[certification].status == 'failed') {
                program.statsByYear[sessionYear].certificationFailed += 1;
              } else if (stats.certifications[certification].status == 'passed') {
                program.statsByYear[sessionYear].certificationPassed += 1;
              } else {
                program.statsByYear[sessionYear].certificationPending += 1;
              }
            }
          }
          let userExt = { ['id']: users[user]._id, ...users[user], ...stats };
          delete userExt._id;
          program.programSession[sessionId].users.push(userExt);
        }
      }
  }
 /* yearMin = Math.min(...years);
  yearMax = Math.max(...years);
  $(`#list`).append(
    $('<option></option>')
      .attr('value', 'Total')
      .text(`${yearMin} - ${yearMax}`)
  );
  years.forEach(element => {
    $(`#list`).append(
      $('<option></option>')
        .attr('value', [element])
        .text(element)
    );
  });
  $('select').selectpicker('refresh');*/

  return programsList;
};

ProgramsList().then(result => setTableList(programsList, 'Total'));


function setTableList(programsList, year) {
  numberHoursPeriod = 0;
  numberCertificationPeriod = 0;
  numberSessionPeriod = 0;
  tableList = [];
  let periodArray;
  if (year == 'Total') {
    periodArray = [...years];
  } else {
    periodArray = year;
  }
  programsList.forEach(program => {
    let template = {
      id: '',
      topics: '',
      skills: '',
      sessionNumber: 0,
      usersEngagedNumber: 0,
      usersCompletedNumber: 0,
      globalTime: 0,
      certificationAttemps: 0,
      certificationPassed: 0,
      certificationFailed: 0,
      certificationPending: 0,
      averageScore: 0,
      averageDuration: 0,
      periodNumber: 0
    };
    periodArray.forEach(period => {
      if (program.statsByYear[period] && template.id == '') {
        template.id = program.id;
        template.name = program.name;
        if (program.topics.length < 1) {
          template.topics = 'Aucune';
        } else {
          program.topics.forEach(topic => {
            if (template.topics == '') {
              template.topics = topic.name;
            } else {
              template.topics += ' - ' + topic.name;
            }
          });
        }
        if (program.skills.length < 1) {
          template.skills = 'Aucune';
        } else {
          program.skills.forEach(skill => {
            if (template.skills == '') {
              template.skills = skill.name;
            } else {
              template.skills += ' - ' + skill.name;
            }
          });
        }
      }
      if (program.statsByYear[period]) {
        template.periodNumber++;
        template.sessionNumber += program.statsByYear[period].sessionNumber;
        numberSessionPeriod += program.statsByYear[period].sessionNumber;
        template.usersEngagedNumber +=
          program.statsByYear[period].usersEngagedNumber;
        template.usersCompletedNumber +=
          program.statsByYear[period].usersCompletedNumber;
        template.globalTime += program.statsByYear[period].globalTime;
        numberHoursPeriod += program.statsByYear[period].globalTime;
        if (program.statsByYear[period].certificationAttemps != 'N/A') {
          template.certificationAttemps +=
            program.statsByYear[period].certificationAttemps;
        } else {
          template.certificationAttemps =
            program.statsByYear[period].certificationAttemps;
        }
        if (program.statsByYear[period].certificationPassed != 'N/A') {
          template.certificationPassed +=
            program.statsByYear[period].certificationPassed;
          numberCertificationPeriod +=
            program.statsByYear[period].certificationPassed;
        } else {
          template.certificationPassed =
            program.statsByYear[period].certificationPassed;
        }
        if (program.statsByYear[period].certificationFailed != 'N/A') {
          template.certificationFailed +=
            program.statsByYear[period].certificationFailed;
        } else {
          template.certificationFailed =
            program.statsByYear[period].certificationFailed;
        }
        if (program.statsByYear[period].certificationPending != 'N/A') {
          template.certificationPending +=
            program.statsByYear[period].certificationPending;
        } else {
          template.certificationPending =
            program.statsByYear[period].certificationPending;
        }
        template.averageDuration +=
          program.statsByYear[period].averageDuration / 60;
        template.averageScore += program.statsByYear[period].averageScore;
      }
    });
    if (template.id != '') {
      template.globalTime = (template.globalTime / 60).toFixed(1);
      template.averageDuration = (
        template.averageDuration / template.periodNumber
      ).toFixed(1);
      template.averageScore = (
        template.averageScore / template.periodNumber
      ).toFixed(1);
      tableList.push(template);
    }
  });

  let table = $('#table').DataTable();
  table.clear();
  table.rows.add(tableList).draw();
  $('div.pageDiv a').html(
    table.page.info().page + 1 + '/' + table.page.info().pages + ' Pages'
  );
  pageTitle = `${yearSelected} : Liste des formations`;
  $(document).prop('title', pageTitle);
  $('#pageTitle').html(pageTitle);
  $('#periodNumberSession').html(numberSessionPeriod);
  $('#periodNumberCertification').html(numberCertificationPeriod);
  $('#periodNumberHours').html((numberHoursPeriod / 60).toFixed(0));
}

$(document).ready(function () {
  $('select.selectPeriod').change(function() {
    if (val !== '') {
      $('.btn-getProjects')
        .addClass('enabled')
        .removeClass('disabled');
    }
    yearSelected = [];
    yearSelected.push($(this).val());
  });
  function fileName() {
    yearSelected = $('select.selectPeriod').val();
    return `${today} - Liste des Formations - ${yearSelected}`;
  }

  let table = $('#table').DataTable({
    data: tableList,
    columns: [
      { data: 'id' },
      { data: 'name' },
      { data: 'topics' },
      { data: 'skills' },
      { data: 'sessionNumber' },
      { data: 'usersEngagedNumber' },
      { data: 'usersCompletedNumber' },
      { data: 'globalTime' },
      { data: 'certificationAttemps' },
      { data: 'certificationPassed' },
      { data: 'certificationFailed' },
      { data: 'certificationPending' },
      { data: 'averageDuration' },
      { data: 'averageScore' }
    ],
    columnDefs: [
      {
        targets: 0,
        visible: false,
        searchable: true
      },
      {
        targets: 1
      }
    ],
    language: {
      lengthMenu: 'Afficher _MENU_ résultats par page',
      zeroRecords: 'Pas de résultat',
      info: '_PAGE_ / _PAGES_ pages',
      infoEmpty: 'Pas de résultat',
      infoFiltered: '(filtre sur _MAX_ total lignes)',
      thousands: ' '
    },
    order: [[5, 'desc']],
    pageLength: 4,
    autoWidth: false,
    scrollCollapse: true,
    pageResize: false,
    fixedHeader: true,
    responsive: true,
    searching: true,
    paging: true,
    lengthChange: true,
    buttons: [
      {
        extend: 'excelHtml5',
        createEmptyCells: true,
        exportOptions: {
          order: 'applied',
          columns: ':visible'
        },
        autoFilter: true,
        filename: function() {
          return fileName();
        },
        title: '',
        customize: function(xlsx) {
          let source = xlsx.xl['workbook.xml'].getElementsByTagName('sheet')[0];
          source.setAttribute('name', $('select.selectPeriod').val());
          let sheet = xlsx.xl.worksheets['sheet1.xml'];
          $('col:eq(0)', sheet).attr('width', 40);
          $('col:eq(1)', sheet).attr('width', 35);
          $('col:eq(2)', sheet).attr('width', 40);
          let new_style =
            '<?xml version="1.0" encoding="UTF-8"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac" xmlns:x14ac="https://schemas.microsoft.com/office/spreadsheetml/2009/9/ac"><numFmts count="2"><numFmt numFmtId="171" formatCode="d/mm/yyyy;@"/><numFmt numFmtId="172" formatCode="m/d/yyyy;@"/></numFmts><fonts count="3" x14ac:knownFonts="1"><font><b/><sz val="12"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font><font><sz val="10"/><color rgb="FF000000"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font><font><b/><sz val="10"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/><scheme val="minor"/></font></fonts><fills count="6"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFF00FF"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF808080"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FF008000"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFF0000"/><bgColor indexed="64"/></patternFill></fill><fill><patternFill patternType="solid"><fgColor rgb="FFFF9900"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="2"><border><left/><right/><top/><bottom/><diagonal/></border><border><left style="thin"><color indexed="64"/></left><right style="thin"><color indexed="64"/></right><top style="thin"><color indexed="64"/></top><bottom style="thin"><color indexed="64"/></bottom><diagonal/></border></borders><cellStyleXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/><xf numFmtId="9" fontId="1" fillId="0" borderId="0" applyFont="0" applyFill="0" applyBorder="0" applyAlignment="0" applyProtection="0"/></cellStyleXfs><cellXfs count="8"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="center" wrapText="1"/></xf><xf numFmtId="0" fontId="2" fillId="2" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="top"/></xf><xf numFmtId="0" fontId="2" fillId="3" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="1" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="4" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="2" fillId="5" borderId="1" xfId="0" applyAlignment="1"><alignment horizontal="center" vertical="center"/></xf><xf numFmtId="0" fontId="1" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment horizontal="center" vertical="center" wrapText="1"/></xf></cellXfs><cellStyles count="2"><cellStyle name="Procent" xfId="1" builtinId="5"/><cellStyle name="Standard" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/><colors><mruColors><color rgb="FF663300"/><color rgb="FFFFCC00"/><color rgb="FF990033"/><color rgb="FF006600"/><color rgb="FFFF9999"/><color rgb="FF99CC00"/></mruColors></colors><extLst><ext uri="{EB79DEF2-80B8-43e5-95BD-54CBDDF9020C}" xmlns:x14="https://schemas.microsoft.com/office/spreadsheetml/2009/9/main"><x14:slicerStyles defaultSlicerStyle="SlicerStyleLight1"/></ext></extLst></styleSheet>';
          xlsx.xl['styles.xml'] = $.parseXML(new_style);
          //Apply a style to the header columns
          $('row c', sheet).attr('s', '1');
          $('row c[r^="D"]', sheet).each(function() {
            $(this).attr('s', '7');
          });
          $('row c[r^="E"]', sheet).each(function() {
            $(this).attr('s', '7');
          });
          $('row c[r^="F"]', sheet).each(function() {
            $(this).attr('s', '7');
          });
          $('row c[r^="G"]', sheet).each(function() {
            $(this).attr('s', '7');
          });
          $('row c[r^="H"]', sheet).each(function() {
            $(this).attr('s', '7');
          });
          $('row c[r^="I"]', sheet).each(function() {
            $(this).attr('s', '7');
          });
          $('row c[r^="J"]', sheet).each(function() {
            $(this).attr('s', '7');
          });
          $('row c[r^="K"]', sheet).each(function() {
            $(this).attr('s', '7');
          });
          $('row c[r^="L"]', sheet).each(function() {
            $(this).attr('s', '7');
            $('row c[r^="M"]', sheet).each(function() {
              $(this).attr('s', '7');
            });
          });
          $('row:first c', sheet).attr('s', '2');
        }
      },
      {
        extend: 'pdfHtml5',
        exportOptions: {
          order: 'applied',
          columns: ':visible'
        },
        filename: function() {
          return fileName();
        },
        title: function() {
          return fileName();
        },
        customize(doc) {
          doc.pageOrientation = 'landscape';
          doc.pageMargins = [40, 60, 40, 60];

          let nomFichier = function() {
            return fileName();
          };
          let objLayout = {};
          objLayout['hLineWidth'] = function(i) {
            return 0.5;
          };
          objLayout['vLineWidth'] = function(i) {
            return 0.5;
          };
          objLayout['hLineColor'] = function(i) {
            return '#aaa';
          };
          objLayout['vLineColor'] = function(i) {
            return '#aaa';
          };
          objLayout['paddingLeft'] = function(i) {
            return 4;
          };
          objLayout['paddingRight'] = function(i) {
            return 4;
          };
          doc.content[1].layout = objLayout;
          tpretard = table
            .column(10)
            .data()
            .toArray();
          for (var i = 0; i < tpretard.length; i++) {
            doc.content[1].table.body[i + 1][9].color = 'white';
            doc.content[1].table.body[i + 1][9].bold = 'true';
            if (tpretard[i] > 100) {
              doc.content[1].table.body[i + 1][9].fillColor = 'red';
            } else if (tpretard[i] > 85 && tpretard[i] < 99) {
              doc.content[1].table.body[i + 1][9].fillColor = 'orange';
            } else {
              doc.content[1].table.body[i + 1][9].fillColor = 'green';
            }
          }
          cloture = table
            .column(0)
            .data()
            .toArray();
          for (var i = 0; i < cloture.length; i++) {
            doc.content[1].table.body[i + 1][0].color = 'white';
            doc.content[1].table.body[i + 1][0].bold = 'true';
            if (cloture[i] > 0) {
              doc.content[1].table.body[i + 1][0].fillColor = 'green';
            } else {
              doc.content[1].table.body[i + 1][0].fillColor = '#d51366';
            }
          }
          doc.styles.title = {
            bold: 'true',
            color: '#d51366',
            fontSize: '20',
            alignment: 'center'
          };
          doc.styles.tableHeader = {
            bold: 'true',
            color: 'white',
            fillColor: '#6C757D',
            alignment: 'center'
          };
          doc.styles.tableBodyEven = {
            background: '',
            alignment: 'center'
          };
          doc.styles.tableBodyOdd = {
            fillColor: '#F2F2F2',
            alignment: 'center'
          };
          doc.styles.tableFooter = {
            background: '',
            alignment: 'center'
          };
          doc.styles['td:nth-child(2)'] = {
            width: '100px',
            'max-width': '100px'
          };
          doc.footer = function(page, pages) {
            return {
              columns: [
                {
                  text: fileName()
                },
                {
                  alignment: 'center',
                  image:
                    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIsAAAA4CAYAAADNRwskAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAACGBJREFUeNrsXUFu6zYQZYzs7Q90b2fbTZwTWDnAhxXg762suoxygsgniLLsKvK+QG30AFFOEHvTbZx9gdonSDnuKGXGJEVKlGPXHIDItyVzyOGb4cxwpH/y/v7Odknfhz8i/icSvor/mP023xHvPv+TCl/NOe+YfSGVjYlfh2v94jO/FnzVWE+/gGePt4HwubND3h3Cex+obEz9fRlzi3ny5MHiyYPF05fRV/gsOfm89MugpUwis+MAC/fm832Z/CEQl1fmtyFP3mfx9D/2Wb4Pf3SYkPQRtorahAmnjsQ/6QnfQRJqZdEn9BfgmANyGfqBBN+0iUSfwDugMmuKN5Wh7drg70Mcb0fiL+Y45tI1KHyWKW9tgcGlI8BAv13h8zUC5U747tLEh+FjggWKeBuV3DqE/vn9b+gcpjZgVPCGMSeWvBNH/gZkcMWk3InhmCMcc1dz2wDn9Mjvn+CYlQFHCwU5Jd/HDjQiIgNdS/gYaTNv8Lsng8USqYugnKN2sYq8YbFeK/CGBVhW5V3HEgFf4F8CFEowv1eYL1pQpc+SUg1BbapDEQ0BbTUcBb1Eja1KILAXBK/tlgMW72bXvGsq6IslSCjBfHMZYFq4D8Ie+1yy2LZmeyAxpzZ9hLhYbcllMJlXvH3jYz8pGm5pt7y9SX7zKPEzyoByLrk8w+30jPC+4G2s4t00YLD/R8XlCY75Asf6TZDVQnI/zHtJDcYpSf4MyFaUVBw7/d1MtxcqLEomAQosVKzqS8jhpCi8lPRxXwMooEyRhvccHdyE91HIrk0A00jeRAOUB/RDVmSsK5xjIasA5S1aJBj7FK4Vv2+R5I+oFe0q2oDCDqtaFfz9VAKUaz7G0BR0OJ+eQnPKgE6BMobSAAveKUZMlHfqYHuXWXEqX/APr6DUwWTrRyXrowWiFiZT5VkyB45uSBb6zTKyiiV77nUVjURBBaaAQYtGfZRb3k9Sgfcceb8RbXVtWaj1BKAAsDfBxJ8//TLlLTaRFW+RBDBDtDylYDmv4M0nNa1KLNHqygIWALM2BCrdPtOavKmVHbiKkNCqUOc/IXkekOk9B8ySt8BgzJFEuZItsKCZnVS1LohAGi7bLHQksUpJXaHiosUGQB25TiHgwo1dBQ8livmsATesyxMHTM5bz2AdtgAuS/fTxR2p4m4DJlPLcDksEUadRcsUkYqK98TGKTfYKnS8qlJQwYpDEPPKAZPw1tEAfEbH3FI4OwtbTUCTOKq52DTcnjK3NLUQfOYQqCsi/K6FAurk/cmKF36KIUHCErYm1drS+QenGk14JOY4tbQqzxXCZZEWddP0EtIl2ahphhDYJW/af5/VK9XoSeZmS7DlP6IDHP/816+5pr/+qUYDRS8bNCEsQW5UJwnHtg+5XAOlrM9OiZVzTXUL1aklrHN4eY7+zAxBswRFJcrSbmnMZma6FUnOgd4sTeI+0PmO+fX3UAZD3VZ9WuKU3ZB4u6fYWqKm9vsd0oIA5rlhfss9mz9Ergm3Kqk1WAAUHBwzEsfHNJx0cQ6kEF5vx9pMt6jIYTTUBOXsc6lHHUv1gEBZ6XzIsko5k60okYSc1v4GLsyaRAyuARNors0PYJvQKVdQoQ+wnmccJLEIFJVP1CpZwCnTnBfVPQdSaItVyG4Zag4teIf7jBRUrqpnefC7Kw6QAJxZxT00IZmb1OCmmk4i9jnj+lyzpHCrCKtuPsIi55MTyzZymJbPeHsXWupoTlPLOcL8xhwgPd6mFgHLhpcJWDIiRPG8KHbp2GKWdU3yAJmDxQKTOirhLasYbIq3K7DQfroaIMIxDoAkMbDAqcy1aBks4Eqh8QHbziBmDViAIdaHVF2sPjPPBCcSxcgc83Z2jID9PJCvb8h2BBbzgoMkkvgldLyy8pA1kx0kWiB4xGqcLpcIIGXbxw33VUw3Ajpn8mo7lfC35orbSMcB7zVzcDgpATg984JCq836gCXhbW4I7FySb/oo4m4ZClFWdjloMLcSsu2SAtCYeVFbUaYhCK4nslgLg7mCkGcS5ZibOJBgxtEaPUlAGrg+whDKIKi87lBeoYGsEgVQJuIpts3jqxlTp8BdntAWOR6ZZm7S0vzaAs1ljvmRJYa6PQz5RooIAK79bTCESCK8rqCxmcB7hXyL55hUEdd1Uy8tgn4RyJlEXr/joyk5pgfmQmjc14x3gbUtH9SyGFDG1Ef8WRMCwMmoCorvUHtfEADw70cFUKCP0FSrhYKpieRyl/B+xX/fKwQPGn/R9DPLmOYImLzIq4tyucexPuEchhrl34oEbR9fzRQIzJvKJeCgx8ys0k1GMzT/c0veRZnhVQ3emwhkV69BQz49BciN8y/UorgES7oDISQohDHTFzBRkFxikfeqpsYC71sL3hPkHTVQZmEK8jMcx9oQJDC/vu4A+GTXLyB0lOTqCz5K8ax2Yd1Au/KmFgnzEAHyLtocfZe8KSvrINejfNbZ1N88SLB4+hryr9zw5MHiyYPFkweLJw8WTx4snjxYPHnS0qkXweESPIIKf1UFTfggfEC+zsnDZPQ3Efv3FBsSeJtaJn5/5sFy+FRU9yeK6wH7/ATAB2AUQAFQ0IPYIT6xGPht6Dhoc1aFLdNYKQAKnCVdc2sCrxMrDlHhlD/xluU4aKnbepCKCr6wuBeKunEr2/wHWR4sR7Jd8UUvtqMx9XHwfS1tBMgnUGFJZuB9luMhKEFYFlZGct3ohN6D5Tgo0z0CAlX/3LoAoLrgzIrPO+M2lHiwHA/1hPfJLRVPIQJAoOzyHt8IBdtRj/336pUHHw0dB0GUU9TeRgrrAqB4EELyoqYZgDKB56G9ZTlsGpdczw2/KwATY65FfHzkI4n3jwADAPi15J02MM5sAAAAAElFTkSuQmCC',
                  fit: [75, 75]
                },
                {
                  //margin: [0, 40, 0, 0],
                  alignment: 'right',
                  text: [
                    'Page ',
                    { text: page.toString() },
                    ' sur ',
                    { text: pages.toString() }
                  ]
                }
              ],
              margin: 20
            };
          };
        }
      }
    ],
    dom:
      '<"bottom row"<"col-xl-2"<"pageDiv">><"col"<"row justify-content-start mt-2"B>><"col"<"row justify-content-center navDiv">><"col"<"row justify-content-end dateDiv">>'
  });
  function infos() {
    return {
      page: table.page.info().page,
      pages: table.page.info().pages
    };
  }
  /** *************************************Gestion Bas de Page Tableau ********************************* */
  $('div.dateDiv').append('<a></a>');

  /** ************** Previous Button ************ */
  $('div.navDiv').append(
    "<div class='col text-center' id='previousButton'>Previous</div>"
  );
  $('#previousButton').click(function() {
    if (infos().page === 0) {
      table.page('last').draw('page');
    } else {
      table.page('previous').draw('page');
    }
    $('div.pageDiv a').html(`${infos().page + 1}/${infos().pages} Pages`);
  });

  /** ************** Next Button *********** */
  $('div.navDiv').append("<div class='col text-center' id='nextButton'>Next");
  $('#nextButton').click(function() {
    if (infos().page + 1 == infos().pages) {
      table.page('first').draw('page');
      $('div.pageDiv a').html(`${infos().page + 1}/${infos().pages} Pages`);
    } else {
      table.page('next').draw('page');
      $('div.pageDiv a').html(`${infos().page + 1}/${infos().pages} Pages`);
    }
  });
  $('div.pageDiv').append('<a></a>');
  $('div.pageDiv a').html(`${infos().page + 1}/${infos().pages} Pages`);

  /** ************************************* Reload ********************************* */
  $('#pauseButton').click();
  setInterval(function() {
    const date = moment().format('DD[/]MM[/]YYYY [|] HH[:]mm[:]ss');
    $('div.dateDiv a').html(date);
  }, 1000);

  $('#table tfoot th').each(function() {
    var title = $('#table thead th')
      .eq($(this).index())
      .text();
    $(this).html('<input type="text" placeholder="' + title + '" />');
  });
  $('#table tfoot input').on('keyup change', function() {
    table
      .column(
        $(this)
          .parent()
          .index() + ':visible'
      )
      .search(this.value)
      .draw();
  });
});
//Date d'aujourd'hui
$(document).ready(function () {
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
