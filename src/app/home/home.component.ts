import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../models/user.model';
import { UserService } from '../shared/user.service';
import * as Chart from 'chart.js';
import { AuditService } from '../shared/audit.service';
import { AuditActionService } from '../shared/auditAction.service';
import { EventService } from '../shared/event.service';
import { DatePipe } from '@angular/common';
import { AreaService } from '../shared/area.service';
import { NotificationsService } from '../notification.service';
import { AppComponent } from '../app.component';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  providers: [DatePipe],
})
export class HomeComponent implements OnInit {
  userDetails;
  loading = false;
  user: User;
  countAudits: any;
  countActions: any;
  countEvents: any;
  status = [
    { name: 'Créées', value: 'CREATED' },
    { name: 'Commencées', value: 'STARTED' },
    { name: 'Finies', value: 'FINISHED' },
    { name: 'Supprimées', value: 'CANCELED' },
  ];
  usersType = ['Authentifiés', 'Anonymes'];
  hours = ['Matin', 'Après-midi', 'Soir'];
  requestType = [
    { name: 'Idée innovante', value: 'home.innovativeIdea' },
    { name: 'Remerciement', value: 'home.congratulation' },
    { name: 'Emotion', value: 'home.emotion' },
    { name: 'Anomalie', value: 'home.anomaly' },
  ];
  anomalyType = [
    'Securité personne',
    'Qualité produit',
    'Salubrité produit',
    'Equipement',
    'Environnement',
    'Condition de travail',
  ];
  imageToShow: any;
  chartname = '';
  requests: any;
  areas: any;
  users: any;
  organisationService: any;
  newChart: any;
  newChart1: any;
  lineChart = 'line';
  load = false;
  webSocketAPI: NotificationsService;
  webSocketAPI1: AppComponent;
  statusChart: any;
  userChart: any;
  hoursChart: any;
  requestTypeChart: any;
  anomalyTypeChart: any;

  statusData: any = [];
  userData: any = [];
  totalUserData = 0;
  hoursData: any = [];
  requestTypeData: any = [];
  requestTypeLabels: any = [];
  requestTypeCumulative: any = [];
  requestTypeColors: any = [];
  anomalyTypeData: any = [];

  // Flags to track if charts have data
  hasStatusData = false;
  hasUserData = false;
  hasHoursData = false;
  hasRequestTypeData = false;
  hasAnomalyTypeData = false;

  authentifiedRequests: any = [];

  auditorId = -1;
  filteredStructure = '';
  filteredRequestStatus = '';
  filteredRequestType = '';
  minDate = '';
  maxDate = '';
  structure = [];
  requester = [];
  printing = false;
  title = '';
  selectedUser = '';
  selectedStatus = '';
  selectedRequestType = '';
  today = new Date();
  fromDate: Date;
  toDate: Date;

  // Professional chart colors
  private chartColors = {
    status: ['#0d9488', '#0284c7', '#059669', '#dc2626'],
    users: ['#059669', '#dc2626'],
    hours: ['#d97706', '#0284c7', '#7c3aed'],
    requestType: ['#0d9488', '#0284c7', '#7c3aed', '#dc2626'],
    anomaly: ['#0d9488', '#0284c7', '#059669', '#dc2626', '#7c3aed', '#d97706'],
    // Sentiment-based colors for request types
    requestTypeSentiment: {
      'Idée innovante': '#10b981', // Green - positive/innovative
      Remerciement: '#3b82f6', // Blue - positive/gratitude
      Emotion: '#f59e0b', // Orange - neutral/mixed
      Anomalie: '#ef4444', // Red - negative/problem
    },
  };

  @ViewChild('printable', { static: false }) pdfContent: ElementRef;

  statusConstants = [
    { name: 'Created', value: 'CREATED' },
    { name: 'Started', value: 'STARTED' },
    { name: 'Finished', value: 'FINISHED' },
    { name: 'Canceled', value: 'CANCELED' },
  ];

  constructor(
    public service: UserService,
    public auditService: AuditService,
    public actionService: AuditActionService,
    public eventService: EventService,
    public areaService: AreaService,
    public userService: UserService,
    private router: Router,
    private datepipe: DatePipe
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.service.getUserProfile();

    if (localStorage.getItem('token') == null) {
      this.router.navigateByUrl('/user/login');
    }

    this.userService.getAllUsers().subscribe((res) => {
      this.users = res || [];
      this.users = this.users.body;
    });

    this.userService.getAllOrganisationServices().subscribe((res) => {
      this.organisationService = res || [];
      this.organisationService = this.organisationService.body;
      const filteredList = this.organisationService.filter(
        (item) => item !== '-'
      );
      this.organisationService = filteredList;
    });
    this.getRequests();
  }

  getRequests(): void {
    this.auditService
      .getRequestsByStatus({
        auditorId: this.auditorId,
        organisationService: this.filteredStructure,
        status: this.filteredRequestStatus,
        requestType: this.filteredRequestType,
        minDate: this.minDate,
        maxDate: this.maxDate,
      })
      .subscribe(
        (res: HttpResponse<any>) => this.onSuccess(res.body, res.headers),
        () => this.onError()
      );
  }

  filterRequests(): void {
    // Format dates if they exist
    if (this.fromDate) {
      this.minDate = this.datepipe.transform(
        this.fromDate,
        'yyyy-MM-dd HH:mm:ss'
      );
    } else {
      this.minDate = '';
    }

    if (this.toDate) {
      this.maxDate = this.datepipe.transform(
        this.toDate,
        'yyyy-MM-dd HH:mm:ss'
      );
    } else {
      this.maxDate = '';
    }

    this.getRequests();
  }

  clearDateFilter(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.fromDate = null;
    this.toDate = null;
    this.minDate = '';
    this.maxDate = '';
    this.filterRequests();
  }

  clearRequesterFilter(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.auditorId = -1;
    this.filterRequests();
  }

  clearStructureFilter(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.filteredStructure = '';
    this.filterRequests();
  }

  clearStatusFilter(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.filteredRequestStatus = '';
    this.filterRequests();
  }

  clearRequestTypeFilter(event?: Event): void {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    this.filteredRequestType = '';
    this.filterRequests();
  }

  bakeStatusChart(): void {
    this.statusData = [];
    let created = 0;
    let started = 0;
    let finished = 0;
    let canceled = 0;

    for (let i = 0; i < this.requests.length; i++) {
      if (this.requests[i].status === 'CREATED') {
        created = created + 1;
      }
      if (this.requests[i].status === 'STARTED') {
        started = started + 1;
      }
      if (this.requests[i].status === 'FINISHED') {
        finished = finished + 1;
      }
      if (this.requests[i].status === 'CANCELED') {
        canceled = canceled + 1;
      }
    }
    this.statusData.push(created, started, finished, canceled);
    this.hasStatusData = this.statusData.some((val) => val > 0);
    this.getStatusChart();
  }

  bakeUsersChart(): void {
    this.userData = [];
    let authenticated = 0;
    let anonymous = 0;

    for (let i = 0; i < this.requests.length; i++) {
      if (this.requests[i].anonymous === false) {
        authenticated = authenticated + 1;
      }
      if (this.requests[i].anonymous === true) {
        anonymous = anonymous + 1;
      }
    }
    this.totalUserData = authenticated + anonymous;
    this.userData.push(authenticated, anonymous);
    this.hasUserData = this.totalUserData > 0;
    this.getUserChart();
  }

  bakeHoursChart(): void {
    this.hoursData = [];
    let day = 0;
    let mid = 0;
    let night = 0;

    for (let i = 0; i < this.requests.length; i++) {
      const date = new Date(this.requests[i].createdDate);
      const hour = date.getUTCHours();

      if (hour < 12) {
        day = day + 1;
      } else if (hour < 18) {
        mid = mid + 1;
      } else {
        night = night + 1;
      }
    }
    this.hoursData.push(day, mid, night);
    this.hasHoursData = this.hoursData.some((val) => val > 0);
    this.getHoursChart();
  }

  bakeRequestTypeChart(): void {
    this.requestTypeData = [];
    this.requestTypeLabels = [];
    this.requestTypeCumulative = [];
    let anomaly = 0;
    let innovativeIdea = 0;
    let congratulation = 0;
    let emotion = 0;

    for (let i = 0; i < this.requests.length; i++) {
      if (this.requests[i].requestType.translator === 'home.anomaly') {
        anomaly = anomaly + 1;
      }
      if (this.requests[i].requestType.translator === 'home.innovativeIdea') {
        innovativeIdea = innovativeIdea + 1;
      }
      if (this.requests[i].requestType.translator === 'home.congratulation') {
        congratulation = congratulation + 1;
      }
      if (this.requests[i].requestType.translator === 'home.emotion') {
        emotion = emotion + 1;
      }
    }

    // Create array of objects with labels and values
    const dataArray = [
      { label: 'Idée innovante', value: innovativeIdea },
      { label: 'Remerciement', value: congratulation },
      { label: 'Emotion', value: emotion },
      { label: 'Anomalie', value: anomaly },
    ];

    // Sort in descending order
    dataArray.sort((a, b) => b.value - a.value);

    // Extract sorted labels and data
    this.requestTypeLabels = dataArray.map((item) => item.label);
    this.requestTypeData = dataArray.map((item) => item.value);

    // Assign sentiment-based colors to sorted labels
    this.requestTypeColors = this.requestTypeLabels.map(
      (label) => this.chartColors.requestTypeSentiment[label] || '#64748b'
    );

    // Calculate cumulative percentages for Pareto
    const total = this.requestTypeData.reduce((sum, val) => sum + val, 0);
    let cumulative = 0;
    this.requestTypeCumulative = this.requestTypeData.map((value) => {
      cumulative += value;
      return total > 0 ? (cumulative / total) * 100 : 0;
    });

    this.hasRequestTypeData = total > 0;
    this.getRequestTypeChart();
  }

  bakeAnomalyTypeChart(): void {
    this.anomalyTypeData = [];
    let security = 0;
    let quality = 0;
    let healthiness = 0;
    let equipment = 0;
    let environment = 0;
    let workCondition = 0;

    for (let i = 0; i < this.requests.length; i++) {
      if (this.requests[i].requestType.translator === 'home.anomaly') {
        for (let j = 0; j < this.requests[i].requestAnswersList.length; j++) {
          if (
            this.requests[i].requestAnswersList[j].answer ===
            'home.personalSecurity'
          ) {
            security = security + 1;
          }
          if (
            this.requests[i].requestAnswersList[j].answer ===
            'home.productQuality'
          ) {
            quality = quality + 1;
          }
          if (
            this.requests[i].requestAnswersList[j].answer ===
            'home.productHealthiness'
          ) {
            healthiness = healthiness + 1;
          }
          if (
            this.requests[i].requestAnswersList[j].answer === 'home.equipment'
          ) {
            equipment = equipment + 1;
          }
          if (
            this.requests[i].requestAnswersList[j].answer === 'home.environment'
          ) {
            environment = environment + 1;
          }
          if (
            this.requests[i].requestAnswersList[j].answer ===
            'home.workingCondition'
          ) {
            workCondition = workCondition + 1;
          }
        }
      }
    }
    this.anomalyTypeData.push(
      security,
      quality,
      healthiness,
      equipment,
      environment,
      workCondition
    );
    this.hasAnomalyTypeData = this.anomalyTypeData.some((val) => val > 0);
    this.getAnomalyTypeChart();
  }

  getStatusChart(): void {
    if (this.statusChart !== undefined) {
      this.statusChart.destroy();
    }

    if (!this.hasStatusData) {
      return;
    }

    setTimeout(() => {
      const canvas = document.getElementById(
        'status-chart'
      ) as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Status chart canvas not found');
        return;
      }

      this.statusChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: this.status.map((item) => item.name),
          datasets: [
            {
              label: 'Requêtes',
              backgroundColor: this.chartColors.status,
              borderColor: '#ffffff',
              borderWidth: 2,
              data: this.statusData,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutoutPercentage: 40,
          legend: {
            display: false,
          },
          tooltips: {
            backgroundColor: '#1e293b',
            titleFontColor: '#ffffff',
            bodyFontColor: '#ffffff',
            cornerRadius: 8,
            xPadding: 12,
            yPadding: 12,
          },
        },
      });
    }, 0);
  }

  getUserChart(): void {
    if (this.userChart !== undefined) {
      this.userChart.destroy();
    }

    if (!this.hasUserData) {
      return;
    }

    setTimeout(() => {
      const canvas = document.getElementById('user-chart') as HTMLCanvasElement;
      if (!canvas) {
        console.warn('User chart canvas not found');
        return;
      }

      this.userChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: this.usersType,
          datasets: [
            {
              label: 'Utilisateurs',
              backgroundColor: this.chartColors.users,
              borderColor: '#ffffff',
              borderWidth: 2,
              data: this.userData,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutoutPercentage: 40,
          legend: {
            display: false,
          },
          tooltips: {
            backgroundColor: '#1e293b',
            titleFontColor: '#ffffff',
            bodyFontColor: '#ffffff',
            cornerRadius: 8,
            xPadding: 12,
            yPadding: 12,
          },
        },
      });
    }, 0);
  }

  getHoursChart(): void {
    if (this.hoursChart !== undefined) {
      this.hoursChart.destroy();
    }

    if (!this.hasHoursData) {
      return;
    }

    setTimeout(() => {
      const canvas = document.getElementById(
        'hours-chart'
      ) as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Hours chart canvas not found');
        return;
      }

      this.hoursChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: this.hours,
          datasets: [
            {
              label: 'Plage horaire',
              backgroundColor: this.chartColors.hours,
              borderColor: '#ffffff',
              borderWidth: 2,
              data: this.hoursData,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutoutPercentage: 40,
          legend: {
            display: false,
          },
          tooltips: {
            backgroundColor: '#1e293b',
            titleFontColor: '#ffffff',
            bodyFontColor: '#ffffff',
            cornerRadius: 8,
            xPadding: 12,
            yPadding: 12,
          },
        },
      });
    }, 0);
  }

  getRequestTypeChart(): void {
    if (this.requestTypeChart !== undefined) {
      this.requestTypeChart.destroy();
    }

    if (!this.hasRequestTypeData) {
      return;
    }

    setTimeout(() => {
      const canvas = document.getElementById(
        'request-type-chart'
      ) as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Request type chart canvas not found');
        return;
      }

      // Calculate max value for left Y axis
      const maxValue = Math.max(...this.requestTypeData);
      const yAxisMax = Math.ceil(maxValue * 1.2); // Add 20% margin

      // Find the index where cumulative crosses 80%
      let crossIndex = this.requestTypeCumulative.findIndex((val) => val >= 80);
      if (crossIndex === -1) {
        crossIndex = this.requestTypeCumulative.length - 1;
      }

      // Calculate exact intersection point for 80% line
      let exactCrossX = crossIndex;
      if (crossIndex > 0 && this.requestTypeCumulative[crossIndex] !== 80) {
        // Linear interpolation to find exact crossing point
        const prevVal = this.requestTypeCumulative[crossIndex - 1] || 0;
        const currVal = this.requestTypeCumulative[crossIndex];
        if (currVal !== prevVal) {
          exactCrossX = crossIndex - 1 + (80 - prevVal) / (currVal - prevVal);
        }
      }

      // Chart.js v2 doesn't support mixed charts with type property in datasets
      // We need to create a custom chart type
      const customChartConfig: any = {
        type: 'bar',
        data: {
          labels: this.requestTypeLabels,
          datasets: [
            {
              label: 'Nombre de requêtes',
              backgroundColor: this.requestTypeColors,
              borderColor: this.requestTypeColors,
              borderWidth: 1,
              data: this.requestTypeData,
              yAxisID: 'y-axis-1',
              type: 'bar',
            },
            {
              label: 'Cumul (%)',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              borderColor: '#dc2626',
              borderWidth: 2,
              fill: false,
              data: this.requestTypeCumulative,
              yAxisID: 'y-axis-2',
              type: 'line',
              pointRadius: 4,
              pointBackgroundColor: '#dc2626',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              lineTension: 0.1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          legend: {
            display: true,
            position: 'top',
            labels: {
              fontColor: '#475569',
              fontSize: 12,
              usePointStyle: true,
              generateLabels: function (chart) {
                const data = chart.data;
                if (data.datasets.length) {
                  return data.datasets.map(function (dataset, i) {
                    return {
                      text: dataset.label,
                      fillStyle: i === 0 ? '#6b7280' : '#dc2626',
                      strokeStyle: i === 0 ? '#6b7280' : '#dc2626',
                      lineWidth: 2,
                      hidden: false,
                      index: i,
                    };
                  });
                }
                return [];
              },
            },
          },
          tooltips: {
            backgroundColor: '#1e293b',
            titleFontColor: '#ffffff',
            bodyFontColor: '#ffffff',
            cornerRadius: 8,
            xPadding: 12,
            yPadding: 12,
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function (tooltipItem, data) {
                const datasetLabel =
                  data.datasets[tooltipItem.datasetIndex].label || '';
                const value = tooltipItem.yLabel;
                if (datasetLabel.includes('%')) {
                  return datasetLabel + ': ' + value.toFixed(1) + '%';
                } else {
                  return datasetLabel + ': ' + value;
                }
              },
            },
          },
          scales: {
            xAxes: [
              {
                gridLines: {
                  display: false,
                },
                ticks: {
                  fontColor: '#475569',
                  fontSize: 11,
                },
              },
            ],
            yAxes: [
              {
                id: 'y-axis-1',
                position: 'left',
                gridLines: {
                  color: 'rgba(0, 0, 0, 0.06)',
                },
                ticks: {
                  min: 0,
                  max: yAxisMax,
                  fontColor: '#475569',
                  fontSize: 11,
                  callback: function (value) {
                    return Math.round(value);
                  },
                },
                scaleLabel: {
                  display: true,
                  labelString: 'Nombre de requêtes',
                  fontColor: '#0d9488',
                  fontSize: 12,
                  fontStyle: 'bold',
                },
              },
              {
                id: 'y-axis-2',
                position: 'right',
                gridLines: {
                  display: false,
                },
                ticks: {
                  min: 0,
                  max: 100,
                  fontColor: '#475569',
                  fontSize: 11,
                  callback: function (value) {
                    return value + '%';
                  },
                },
                scaleLabel: {
                  display: true,
                  labelString: 'Cumul (%)',
                  fontColor: '#dc2626',
                  fontSize: 12,
                  fontStyle: 'bold',
                },
              },
            ],
          },
          animation: {
            onComplete: function () {
              const chartInstance = this.chart;
              const ctx = chartInstance.ctx;
              const xScale = chartInstance.scales['x-axis-0'];
              const yScale = chartInstance.scales['y-axis-2'];

              if (xScale && yScale) {
                // Calculate x position for the vertical line
                const dataLength = chartInstance.data.labels.length;
                const barWidth = xScale.width / dataLength;
                const xPos = xScale.left + (exactCrossX + 0.5) * barWidth;

                // Calculate y positions
                const y80 = yScale.getPixelForValue(80);
                const yBottom = yScale.getPixelForValue(0);

                // Get the right edge of the chart
                const xRight = yScale.right;

                ctx.save();
                ctx.setLineDash([6, 4]);
                ctx.strokeStyle = '#000000';
                ctx.lineWidth = 2;

                // Draw horizontal dashed line from right Y-axis (80%) to the intersection point
                ctx.beginPath();
                ctx.moveTo(xRight, y80);
                ctx.lineTo(xPos, y80);
                ctx.stroke();

                // Draw vertical dashed line from intersection point down to x-axis
                ctx.beginPath();
                ctx.moveTo(xPos, y80);
                ctx.lineTo(xPos, yBottom);
                ctx.stroke();

                // Draw a small circle at the intersection point
                ctx.beginPath();
                ctx.setLineDash([]);
                ctx.arc(xPos, y80, 5, 0, 2 * Math.PI);
                ctx.fillStyle = '#000000';
                ctx.fill();
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.stroke();
                ctx.restore();
              }
            },
          },
        },
      };

      this.requestTypeChart = new Chart(canvas, customChartConfig);
    }, 0);
  }

  getAnomalyTypeChart(): void {
    if (this.anomalyTypeChart !== undefined) {
      this.anomalyTypeChart.destroy();
    }

    if (!this.hasAnomalyTypeData) {
      return;
    }

    setTimeout(() => {
      const canvas = document.getElementById(
        'anomaly-type-chart'
      ) as HTMLCanvasElement;
      if (!canvas) {
        console.warn('Anomaly type chart canvas not found');
        return;
      }

      this.anomalyTypeChart = new Chart(canvas, {
        type: 'doughnut',
        data: {
          labels: this.anomalyType,
          datasets: [
            {
              label: "Type d'anomalie",
              backgroundColor: this.chartColors.anomaly,
              borderColor: '#ffffff',
              borderWidth: 2,
              data: this.anomalyTypeData,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutoutPercentage: 40,
          legend: {
            display: false,
          },
          tooltips: {
            backgroundColor: '#1e293b',
            titleFontColor: '#ffffff',
            bodyFontColor: '#ffffff',
            cornerRadius: 8,
            xPadding: 12,
            yPadding: 12,
          },
        },
      });
    }, 0);
  }

  getTableService(): void {
    this.authentifiedRequests = [];
    this.structure = [];
    const filteredStructure = [];
    for (let i = 0; i < this.requests.length; i++) {
      if (this.requests[i].anonymous === false) {
        this.authentifiedRequests.push(this.requests[i].requester.name);
        filteredStructure.push(this.requests[i].requester.service);
      }
    }

    // Create a Map to store the counts of each item
    const countMap = new Map<string, number>();

    // Count the occurrences
    filteredStructure.forEach((item) => {
      const count = countMap.get(item) || 0;
      countMap.set(item, count + 1);
    });

    // Create a list of objects with structure and value
    //      const resultList: { structure: string; value: number }[] = [];
    countMap.forEach((count, structure) => {
      this.structure.push({ structure, value: count });
    });

    this.getUserService();
  }

  getUserService(): void {
    this.requester = [];
    const countMap = new Map<string, number>();

    // Count the occurrences
    this.authentifiedRequests.forEach((item) => {
      const count = countMap.get(item) || 0;
      countMap.set(item, count + 1);
    });

    // Create a list of objects with structure and value
    //      const resultList: { structure: string; value: number }[] = [];
    countMap.forEach((count, name) => {
      this.requester.push({ name, value: count });
    });
  }

  onLogout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/user/login']);
  }

  protected onSuccess(data: any | null, headers: HttpHeaders): void {
    this.requests = data || [];
    this.load = true;
    this.bakeStatusChart();
    this.bakeUsersChart();
    this.bakeHoursChart();
    this.bakeRequestTypeChart();
    this.bakeAnomalyTypeChart();

    this.getTableService();
    this.minDate = this.datepipe.transform(this.minDate, 'yyyy-MM-dd');
    this.maxDate = this.datepipe.transform(this.maxDate, 'yyyy-MM-dd');
  }

  protected onError(): void {}

  generateReport(): any {
    this.printing = true;
    this.title =
      'Rapport_Requetes_' +
      this.datepipe.transform(new Date(), 'yyyy-MM-dd_HHmm');

    const printable = document.getElementById('printable');
    printable.style.display = 'block';

    if (this.auditorId !== -1) {
      for (let i = 0; i < this.users.length; i++) {
        if (this.auditorId === this.users[i].id) {
          this.selectedUser = this.users[i].name;
        }
      }
    }

    if (
      this.filteredRequestStatus !== null &&
      this.filteredRequestStatus !== ''
    ) {
      for (let i = 0; i < this.status.length; i++) {
        if (this.filteredRequestStatus === this.status[i].value) {
          this.selectedStatus = this.status[i].name;
        }
      }
    }

    if (this.filteredRequestType !== null && this.filteredRequestType !== '') {
      for (let i = 0; i < this.requestType.length; i++) {
        if (this.filteredRequestType === this.requestType[i].value) {
          this.selectedRequestType = this.requestType[i].name;
        }
      }
    }

    // Wait for DOM to update before capturing
    setTimeout(() => {
      const content = this.pdfContent.nativeElement;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = 210;
      const pageHeight = 297;
      const margins = { top: 15, bottom: 20, left: 10, right: 10 };
      const usableWidth = pageWidth - margins.left - margins.right;
      const usableHeight = pageHeight - margins.top - margins.bottom;

      html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false,
        width: content.scrollWidth,
        height: content.scrollHeight,
        windowWidth: content.scrollWidth,
        windowHeight: content.scrollHeight,
      }).then((canvas) => {
        const imgWidth = usableWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Calculate how many pages we need
        const totalPagesNeeded = Math.ceil(imgHeight / usableHeight);

        for (let page = 0; page < totalPagesNeeded; page++) {
          if (page > 0) {
            pdf.addPage();
          }

          // Calculate the source rectangle from the canvas for this page
          const sourceY = page * (canvas.height / totalPagesNeeded);
          const sourceHeight = canvas.height / totalPagesNeeded;

          // Create a temporary canvas for this page slice
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = sourceHeight;
          const ctx = pageCanvas.getContext('2d');

          // Draw the slice of the original canvas
          ctx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sourceHeight, // source rectangle
            0,
            0,
            pageCanvas.width,
            pageCanvas.height // destination rectangle
          );

          const pageImgData = pageCanvas.toDataURL('image/png');
          const sliceHeight = usableHeight;

          pdf.addImage(
            pageImgData,
            'PNG',
            margins.left,
            margins.top,
            imgWidth,
            sliceHeight
          );
        }

        // Add page numbers
        const totalPages = pdf.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(9);
          pdf.setTextColor(150);
          pdf.text(
            'Page ' + i + ' / ' + totalPages,
            pageWidth / 2,
            pageHeight - 8,
            { align: 'center' }
          );
        }

        pdf.save(this.title + '.pdf');
        printable.style.display = 'none';
        this.printing = false;
      });
    }, 100);
  }

  // Helper methods for chart legend colors
  getStatusColor(index: number): string {
    return this.chartColors.status[index] || '#64748b';
  }

  getUserColor(index: number): string {
    return this.chartColors.users[index] || '#64748b';
  }

  getHoursColor(index: number): string {
    return this.chartColors.hours[index] || '#64748b';
  }

  getRequestTypeColor(index: number): string {
    return this.chartColors.requestType[index] || '#64748b';
  }

  getAnomalyColor(index: number): string {
    return this.chartColors.anomaly[index] || '#64748b';
  }
}
