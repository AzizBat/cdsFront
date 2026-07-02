import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/shared/user.service';
import { Chart } from "chart.js";
import {DatePipe} from "@angular/common";
import {AreaService} from "../../shared/area.service";
import {SerialNumberService} from "../../shared/serialNumber.service";

@Component({
  selector: 'app-download-apk',
  templateUrl: './product-dashboard.component.html',
  styleUrls: ['./product-dashboard.component.scss'],

})
export class ProductDashboardComponent implements OnInit {

  organisation : any
  newChart : any
  newChart1 : any
  chartname ="";
  countTonnage : any;
  countActions : any;
  countEvents : any;
  areas :any
  lineChart = "line"
  firstSave : any
  todaySN : any
  todayWeight :number =0
  totalDays : any
  totalSerialNumbers : any
  generalDatas : any
  weightPercentage : any
  serialNumberPercentage : any
  defectsPercentage : any
  classData =[]
  defects =0
  totalDefects : any
  dataSN : any
  todaySerialNumber : any
  tab ="weight"
  dataDefects : any
  dataDefectsFiltered =[]
  label1 : any
  label2 : any
  label3 : any
  label4 : any
  load = false

  constructor(
    public service: SerialNumberService,
    private router: Router,
    private userservice: UserService,
    private areaService: AreaService,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {

    if (localStorage.getItem('token') == null)
      this.router.navigateByUrl('/user/login');

    const currentUser = localStorage.getItem('curUser')
    const id = JSON.parse(currentUser).organisationId
    const datepipe: DatePipe = new DatePipe('en-US')
    let d =Date.now()
    let today =datepipe.transform(d, 'MM-dd-yyyy')

    this.userservice.getOrganisation().subscribe(res => (this.organisation = res || []));

    this.service.getGeneralDatas(id).subscribe(res => {(this.generalDatas = res || [])
      this.firstSave = this.generalDatas[0][0].createdDate
      this.totalSerialNumbers = this.generalDatas[2]
      this.classData = this.generalDatas[3]
      this.totalDefects = this.generalDatas[4][0]
      console.log(this.totalDefects)

      let firstDate =datepipe.transform(this.firstSave, 'MM-dd-yyyy')
      let startingDate1  = new Date(firstDate)
      let todayDate  = new Date(today)
      let firstSave : any = new Date(Date.UTC(startingDate1.getFullYear(), startingDate1.getMonth(), startingDate1.getDate()));
      let todaySave : any = new Date(Date.UTC(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate()));
      const x= Math.abs(todaySave.getTime() - firstSave.getTime());
      this.totalDays = Math.ceil(x / (1000 * 3600 * 24));
      this.totalDays =  this.totalDays - Math.floor(this.totalDays/7)

      const averageWeight = this.generalDatas[1]/this.totalDays
      const averageSerialNumbers = this.totalSerialNumbers/this.totalDays

      this.service.getTodaySN(id).subscribe(resp => {(this.todaySN = resp || [])
        this.todaySerialNumber = this.todaySN[0].length
        for (let i of this.todaySN[0].keys()){
          this.todayWeight = this.todayWeight + this.todaySN[0][i].weight
          this.defects = this.defects + this.todaySN[0][i].defects.length
        }

        this.weightPercentage = ((this.todayWeight-averageWeight)/averageWeight *100).toFixed(2)
        this.serialNumberPercentage =((this.todaySN[0].length -averageSerialNumbers)/averageSerialNumbers*100).toFixed(2)
        if(this.todaySerialNumber>0){
        this.defectsPercentage =(this.defects /this.todaySerialNumber*100).toFixed(2)
        }
        else{
          this.defectsPercentage = 0
        }
      });

      if(this.classData.length === 0){
        this.classData = [0,0,0]
      }
      if(this.classData.length ===1){
        this.classData.push(0,0)
      }
      if(this.classData.length ===2){
        this.classData.push(0)
      }

      // @ts-ignore - Chart.js v2 API
      new Chart(document.getElementById("class-chart") as HTMLCanvasElement, {
        type: 'pie',
        data: {
          labels: ["C1", "C2", "C3"],
          datasets: [{
            label: "Population (millions)",
            backgroundColor: ["rgba(61,175,45,0.68)","rgba(246,213,0,0.41)" ,"#ff9999"],
            data: this.classData
          }]
        },
        options: {
          title: {
            display: false,
            text: 'Predicted world population (millions) in 2050'
          },
          legend:{
            position : "left"
          }
        }
      } as any);
      this.load = true
    });

    this.areaService.getAreas1().subscribe(res => {(this.areas = res || [])
      this.areas = this.areas.body.content} );

    const datestarts ="2020-01-01"
    const datestart = datestarts.toString().concat(" 00:00:00")
    const startingDate  = new Date(datestart)
    const dateends: any =new Date
    let formattedStartingDate = datepipe.transform(startingDate, 'yyyy-MM-dd HH:mm:ss')
    let formattedEndingDate = datepipe.transform(dateends, 'yyyy-MM-dd HH:mm:ss')

    this.service.getdetailedStats({
      chartname : "weight",
      startingDate : formattedStartingDate,
      endingDate : formattedEndingDate,
      // filteredAudit : audit,
      filteredArea : -1,
      shift : -1,
      // filteredStatus : status,
      // filteredActor : actor,
    })
      .subscribe(res => {(this.dataSN = res || [])
        if (this.dataSN && this.dataSN.length > 0){
          this.showChart(this.dataSN.body)
        }
        else{
          this.chartVisual([], [], [], [], [])
        }
      })

  }

  filterChart(){
    this.getChart(this.chartname)
  }

  getChart(_chartname:string){
    this.countTonnage =[]
    let filteredTeam = document.getElementById('team') as HTMLSelectElement;
    let filteredArea = document.getElementById('area') as HTMLSelectElement;
    let starting = document.getElementById('from') as HTMLSelectElement;
    let resetStarting = document.getElementById('starting');
    let ending = document.getElementById('to') as HTMLSelectElement;
    let canreset1 = document.getElementById('canreset1');
    let resetEnding = document.getElementById('ending');
    let canreset2 = document.getElementById('canreset2');
    let areaFilter = document.getElementById('areaFilter');
    let canreset4 = document.getElementById('canreset4');
    let teamFilter = document.getElementById('teamFilter');
    let canreset6 = document.getElementById('canreset6');


    let datestarts =""
    let dateends: any =new Date

    dateends = dateends.toString()
    if(starting.value ===""){
      datestarts ="2020-01-01"
    }
    else{
      datestarts =starting.value
      resetStarting.style.display ="none"
      canreset1.style.display ="block"
    }

    if(ending.value ===""){
    }
    else{
      dateends =ending.value
      resetEnding.style.display ="none"
      canreset2.style.display ="block"
    }


    const datestart = datestarts.toString().concat(" 00:00:00")
    let startingDate  = new Date(datestart)

    let d : any = new Date(Date.UTC(startingDate.getFullYear(), startingDate.getMonth(), startingDate.getDate()));
    let dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);

    const datepipe: DatePipe = new DatePipe('en-US')
    let formattedStartingDate = datepipe.transform(startingDate, 'yyyy-MM-dd HH:mm:ss')
    let formattedEndingDate = datepipe.transform(dateends, 'yyyy-MM-dd HH:mm:ss')

    let area = -1
    if(filteredArea.value !== "null"){
      area = parseInt(filteredArea.value)
      areaFilter.style.display = "none"
      canreset4.style.display = "block"
    }

    let team = -1
    if(filteredTeam.value !== "null"){
      team = parseInt(filteredTeam.value)
      teamFilter.style.display = "none"
      canreset6.style.display = "block"
    }

    if (this.tab==="defects"){
      this.dataDefectsFiltered = []
      this.service.getDefects(
        {
          startingDate : formattedStartingDate,
          endingDate : formattedEndingDate,
          filteredArea : area,
          filteredShift : team,
        })
        .subscribe(res => {(this.dataDefects = res || [])
          for (let i of this.dataDefects.body[0].keys()){
            this.dataDefectsFiltered.push([this.dataDefects.body[0][i].createdDate ,this.dataDefects.body[0][i].defects.length ])
          }
          if (this.dataDefectsFiltered.length !== 0){
            this.showChart(this.dataDefectsFiltered)
          }
          else{
            this.chartVisual([], [] , [] ,[], [])
          }
        })
    }


    else{
    this.service.getdetailedStats({
      chartname : "weight",
      startingDate : formattedStartingDate,
      endingDate : formattedEndingDate,
      filteredArea : area,
      filteredShift : team,
    })
      .subscribe(res => {(this.dataSN = res || [])
        if (this.dataSN.body.length !== 0){
          this.showChart(this.dataSN.body)
        }
        else{
          this.chartVisual([], [] , [] ,[], [])
        }
      })
    }
  }

  reset(id:number){
    let filteredAuditor = document.getElementById('team') as HTMLSelectElement;
    let filteredArea = document.getElementById('area') as HTMLSelectElement;
    let starting = document.getElementById('from') as HTMLSelectElement;
    let ending = document.getElementById('to') as HTMLSelectElement;
    let resetStarting = document.getElementById('starting');
    let canreset1 = document.getElementById('canreset1');
    let resetEnding = document.getElementById('ending');
    let canreset2 = document.getElementById('canreset2');
    let areaFilter = document.getElementById('areaFilter');
    let canreset4 = document.getElementById('canreset4');
    let auditorFilter = document.getElementById('teamFilter');
    let canreset6 = document.getElementById('canreset6');


    if (id ===1){
      starting.value =undefined
      resetStarting.style.display = "block"
      canreset1.style.display = "none"
    }

    if (id ===2){
      ending.value =undefined
      resetEnding.style.display = "block"
      canreset2.style.display = "none"
    }

    if (id ===4){
      filteredArea.selectedIndex =0
      areaFilter.style.display = "block"
      canreset4.style.display = "none"
    }
    if (id ===6){
      filteredAuditor.selectedIndex =0
      auditorFilter.style.display = "block"
      canreset6.style.display = "none"
    }
    this.filterChart()
  }

  showChart(data: any) {

    const datepipe: DatePipe = new DatePipe('en-US')
    let cleanData = []
    let defectsData = []
    const date1 = new Date(data[0][0])
    const date2 = new Date(data[data.length - 1][0])
    const diff = Math.abs(date1.getTime() - date2.getTime());
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24));

    for (let i of data.keys()) {
      if (diffDays <= 31) {
        let formattedDate = datepipe.transform(data[i][0], 'dd-MM-yyyy')
        cleanData.push([formattedDate , data[i][1], data[i][2]])
      } else if (diffDays > 31 && diffDays <= 92) {
        const date3 = new Date(data[i][0])
        let d: any = new Date(Date.UTC(date3.getFullYear(), date3.getMonth(), date3.getDate()));
        let dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        let yearStart: any = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const x = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
        cleanData.push([x , data[i][1], data[i][2]])

      } else {
        let formattedDate = datepipe.transform(data[i][0], 'MM-yyyy')
        cleanData.push([formattedDate , data[i][1], data[i][2]])
      }
    }
    let weight = cleanData[0][1]
    let calculate = 1
    let xValues = []
    let yValues = []
    let c1Data = []
    let c2Data = []
    let c3Data = []
    let c1 =0
    let c2 =0
    let c3 =0
    let defects = 0

    if(this.tab ==="weight"){
    for (let i = 0; i < cleanData.length -1 ; i++) {
      if (cleanData[i][0] === cleanData[i+1][0]) {
        weight = weight + cleanData[i + 1][1]
        if(i === cleanData.length -2){
          if (diffDays <= 31 || diffDays > 92) {
              xValues.push(yValues.push(weight))
          }
          else if (diffDays > 31 && diffDays <= 92) {
            xValues.push("week " + cleanData[i][0])
          }
            yValues.push(weight)
        }
      } else {
        if (diffDays <= 31 || diffDays > 92) {
          xValues.push(cleanData[i][0])
        } else if (diffDays > 31 && diffDays <= 92) {
          xValues.push("week " + cleanData[i][0])
        }
        yValues.push(weight)
        weight = cleanData[i + 1][1]
        if (i === cleanData.length -2){
          if (diffDays <= 31 || diffDays > 92) {
            xValues.push(cleanData[ i + 1][0])
          } else if (diffDays > 31 && diffDays <= 92) {
            xValues.push("week " + cleanData[i + 1][0])
          }
            yValues.push(cleanData[i + 1][1])
        }
      }
    }
    }

    if(this.tab ==="pieces"){
      for (let i = 0; i < cleanData.length -1 ; i++) {
        if (cleanData[i][0] === cleanData[i+1][0]) {
          calculate = calculate +1
          if(i === cleanData.length -2){
            if (diffDays <= 31 || diffDays > 92) {
              xValues.push(yValues.push(calculate))

            }
            else if (diffDays > 31 && diffDays <= 92) {
              xValues.push("week " + cleanData[i][0])
            }
            yValues.push(calculate)
            calculate = 1
          }
        } else {
          if (diffDays <= 31 || diffDays > 92) {
            xValues.push(cleanData[i][0])
          } else if (diffDays > 31 && diffDays <= 92) {
            xValues.push("week " + cleanData[i][0])
          }
          yValues.push(calculate)
          calculate = 1
          if (i === cleanData.length -2){
            if (diffDays <= 31 || diffDays > 92) {
              xValues.push(cleanData[ i + 1][0])
            } else if (diffDays > 31 && diffDays <= 92) {
              xValues.push("week " + cleanData[i + 1][0])
            }
            yValues.push(calculate)
            calculate =1
          }
        }
      }
    }

    if(this.tab ==="class"){
      for (let i = 0; i < cleanData.length -1 ; i++) {
        if (cleanData[i][0] === cleanData[i+1][0]) {
          if(cleanData[i][2]==="C1"){
            c1 = c1 +1
          }
          else if(cleanData[i][2]==="C2"){
            c2 = c2 +1
          }
          else if(cleanData[i][2]==="C3"){
            c3 = c3 +1
          }

          if(i === cleanData.length -2){
            if (diffDays <= 31 || diffDays > 92) {
              xValues.push(yValues.push(calculate))

            }
            else if (diffDays > 31 && diffDays <= 92) {
              xValues.push("week " + cleanData[i][0])
            }
            c1Data.push(c1)
            c2Data.push(c2)
            c3Data.push(c3)
            c1 = 0
            c2 = 0
            c3 = 0
          }
        } else {
          if (diffDays <= 31 || diffDays > 92) {
            xValues.push(cleanData[i][0])
          } else if (diffDays > 31 && diffDays <= 92) {
            xValues.push("week " + cleanData[i][0])
          }
          c1Data.push(c1)
          c2Data.push(c2)
          c3Data.push(c3)
          c1 = 0
          c2 = 0
          c3 = 0
          if (i === cleanData.length -2){
            if (diffDays <= 31 || diffDays > 92) {
              xValues.push(cleanData[ i + 1][0])
            } else if (diffDays > 31 && diffDays <= 92) {
              xValues.push("week " + cleanData[i + 1][0])
            }
            c1Data.push(c1)
            c2Data.push(c2)
            c3Data.push(c3)
            c1 = 0
            c2 = 0
            c3 = 0
          }
        }
      }
    }

    if(this.tab ==="defects"){

      for (let i = 0; i < cleanData.length -1 ; i++) {
        if (cleanData[i][0] === cleanData[i+1][0]) {
          defects = defects +cleanData[i][1]
          if(i === cleanData.length -2){
            if (diffDays <= 31 || diffDays > 92) {
              xValues.push(yValues.push(defects))

            }
            else if (diffDays > 31 && diffDays <= 92) {
              xValues.push("week " + cleanData[i][0])
            }
            yValues.push(defects)
            defects = 0
          }
        } else {
          if (diffDays <= 31 || diffDays > 92) {
            xValues.push(cleanData[i][0])
          } else if (diffDays > 31 && diffDays <= 92) {
            xValues.push("week " + cleanData[i][0])
          }
          yValues.push(defects)
          defects = 0
          if (i === cleanData.length -2){
            if (diffDays <= 31 || diffDays > 92) {
              xValues.push(cleanData[ i + 1][0])
            } else if (diffDays > 31 && diffDays <= 92) {
              xValues.push("week " + cleanData[i + 1][0])
            }
            yValues.push(defects)
            defects =0
          }
        }
      }
    }

    if (this.newChart !== undefined) {
      while (this.newChart.data.datasets.length > 0) {
        this.newChart.data.datasets.pop();
      }
    }

    if (this.newChart1 !== undefined) {
      while (this.newChart1.data.datasets.length > 0) {
        this.newChart1.data.datasets.pop();
      }
    }

    this.chartVisual(xValues, yValues ,c1Data, c2Data, c3Data)
    let chart = document.getElementById('detail-chart-div');
    chart.style.visibility = "visible"

  }

  chartVisual(x: any, y: any , c1: any , c2: any , c3 : any){
    console.log(x)
    if (this.tab ==="weight"){
    this.label1 = ["Tons"]
    this.label2 = ["no Data"]
    this.label3 = ["no Data"]
    this.label4 = ["no Data"]
    }

    if (this.tab ==="pieces"){
      this.label1 = ["Piece"]
      this.label2 = ["no Data"]
      this.label3 = ["no Data"]
      this.label4 = ["no Data"]
    }

    if (this.tab ==="class"){
      this.label1 = ["noData"]
      this.label2 = ["C1"]
      this.label3 = ["C2"]
      this.label4 = ["C3"]
    }

    if (this.tab ==="defects"){
      this.label1 = ["Defects"]
      this.label2 = ["no Data"]
      this.label3 = ["no Data"]
      this.label4 = ["no Data"]
    }

    // @ts-ignore
    this.newChart1 = new Chart(document.getElementById("bar-detail-chart") as HTMLCanvasElement, {
      type: "bar",
      data: {
        // labels: x,
        labels: x,
        datasets: [{
          label: this.label1,
          backgroundColor: "rgba(70,210,57,0.28)",
          data: y,
          borderColor: "rgba(61,175,45,0.68)",
          borderWidth: 1
        },
          {
            label: this.label2,
            backgroundColor: "rgba(57,174,210,0.28)",
            data: c1,
            borderColor: "rgba(45,88,175,0.68)",
            borderWidth: 1
          },
          {
            label: this.label3,
            backgroundColor: "rgba(226,121,30,0.53)",
            data: c2,
            borderColor: "rgba(175,132,45,0.68)",
            borderWidth: 1
          },
          {
            label: this.label4,
            backgroundColor: "rgba(226,30,30,0.53)",
            data: c3,
            borderColor: "rgba(175,45,45,0.68)",
            borderWidth: 1
          }
        ]
      },
      options: {
        legend: {
          display: true
        },
        scales: {
          xAxes: [{
            stacked: true
          }],
      },
    },
    } as any);

    // @ts-ignore - Chart.js v2 API
    this.newChart = new Chart(document.getElementById("line-detail-chart") as HTMLCanvasElement, {
      type: "line",
      data: {
        labels: x,
        datasets: [{
          label: this.label1,
          backgroundColor: "rgba(70,210,57,0.28)",
          borderColor: "rgba(61,175,45,0.68)",
          data: y,
          borderWidth: 1
        }
          , {
            label: this.label2,
            backgroundColor: "rgba(57,174,210,0.28)",
            borderColor: "rgba(45,88,175,0.68)",
            data: c1,
            borderWidth: 1
          }
          , {
            label: this.label3,
            backgroundColor: "rgba(226,121,30,0.53)",
            borderColor: "rgba(175,132,45,0.68)",
            data: c2,
            borderWidth: 1
          }

          , {
            label: this.label4,
            backgroundColor: "rgba(226,30,30,0.53)",
            borderColor: "rgba(175,45,45,0.68)",
            data: c3,
            borderWidth: 1
          }
          ]
      },

      options: {
        elements: {
          line: {
            tension: 0
          }
        },

        legend: {
          display: true
        }
      },
    } as any);
  }

  lineChartView(lineChart : boolean){
    let line = document.getElementById('line-chart');
    let bar = document.getElementById('bar-chart');
    if(lineChart ===true){
      line.style.visibility="visible"
      bar.style.visibility="hidden"
    }
    else {
      line.style.visibility="hidden"
      bar.style.visibility="visible"
    }
  }


  onLogout() {
    localStorage.removeItem('token');
    this.router.navigate(['/user/login']);
  }

  changeTab(tabName : string) {
    this.tab = tabName
    this.getChart(this.tab)

  }

}
