import {Component, ElementRef, OnInit, QueryList, ViewChildren} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastrService} from 'ngx-toastr';
import {AuditAction} from 'src/app/models/auditAction.model';
import {AuditActionService} from 'src/app/shared/auditAction.service';
import {UserService} from "../../shared/user.service";
import {Options} from "@angular-slider/ngx-slider";
import swal from 'sweetalert2';
import {User} from "../../models/user.model";
import {AuditService} from "../../shared/audit.service";


@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],

})


export class DetailsComponent implements OnInit {

  selectedAction: any = {
    id : '',
    date : '',
 //   illustrationUri : string;
    status : '',
    instruction : '',
    deadline : '',
    picture : '',
    auditResponseId : '',
    areaName : '',
    affectedUsers : '',
    comments :  '',
    organisationId : '',

  };

  imageToShow: any;
  isImageLoading  = false;
  data: any;
  auditAction: AuditAction;
  user :any
  users :any
  auditActionObject : any
  currentUser : any
  organizer = false
  pageOfItems: Array<User>;
  load = false
  enquete :any
  pap :any
  withoutAnswers :any
  answers :any
  Subanswers :any =[]
  bienTouchee :any =[]
  questionGroup :any
  questions :any =[]
  sortedQuestions :any =[]
  sortedQuestionGroup :any
  valueclosed =[]
  closed = false
  nomPap =[]
  subAnswerIndex =-1
  menageNameList =[]
  selectedItemId :any;
  modifyContentPap : any
  filteredNoAnswer = []






  parentElement = document.getElementById('ngx-slider');

  title = 'ngx-slider';
  value: number = 50;
  options: Options = {
    floor: 0,
    ceil: 100
  };
  sliderValue = 0;


  @ViewChildren("itemElement") private itemElements: QueryList<ElementRef>;

  constructor(
    public service: AuditActionService,
    public auditService: AuditService,
    private router: Router,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    public userservice: UserService,
  ) { }

  ngOnInit() {
     this.currentUser = localStorage.getItem('curUser')
    this.currentUser = JSON.parse(this.currentUser)
    console.log(this.currentUser?.roles[0]?.name)
    // for(let i of this.currentUser.roles.keys()){
    //   if (this.currentUser.roles[i].name !=="ROLE_ORGANIZER"){
    //     this.organizer = true
    //   }
    // }
    const id = this.route.snapshot.paramMap.get('id');
    this.load = true
    this.auditService.getEnquetebyId(Number(id)).subscribe(res => {(
      this.enquete = res.body || [],
      this.auditService.getQuestionGroupByEnqueteId(Number(this.enquete.checklistId)).subscribe(res => {(
        this.questionGroup = res.body || [],
          this.sortQuestionGroup(this.questionGroup)
      )})

    )})




    this.auditService.getCodePapByEnqueteId(Number(id)).subscribe(res => {(
      this.pap = res.body || [],
      this.pap = this.pap[0].content
    )})

    this.auditService.getWithoutAnswers(Number(id)).subscribe(res => {(
      this.withoutAnswers = res.body || [],
      this.filterNoAnswers(this.withoutAnswers)
    )})

    this.auditService.getCodeAnswersbyEnqueteId(Number(id)).subscribe(res => {(
      this.answers = res.body || [],
        this.Pap(this.answers)
    )})


    // this.userservice.getUsers().subscribe(res => {(this.users = res || [])
    //   this.users = this.users.body.content
    // });

  }

  filterNoAnswers(withoutAnswers : any){
    for (let i = 0 ; i<withoutAnswers[0].length ; i ++){
      let exist = false
      for(let j = 0 ; j < withoutAnswers[1].length ; j ++){
        if ( withoutAnswers[0][i] === withoutAnswers[1][j]){
          exist= true
        }
      }
      if(exist === false){
        this.filteredNoAnswer.push(withoutAnswers[0][i])
      }
    }
  }

  sortQuestionGroup(QuestionGroup : any){
    var sortedArray: any = QuestionGroup.sort((obj1, obj2) => {
      if (obj1.order > obj2.order) {
        return 1;
      }
      if (obj1.order < obj2.order) {
        return -1;
      }
      return 0;
    });
    this.sortedQuestionGroup = sortedArray
    for (let i = 0 ; i< this.sortedQuestionGroup.length; i++){
      this.auditService.getQuestionsByEnqueteId(Number(this.sortedQuestionGroup[i].id)).subscribe(res => {(
        this.sortQuestions(res.body)
      )})
    }

  }

  Pap(answers : any){
    for(let i = 0 ; i<answers.length ; i++){
      if(answers[i].questionId === 48){
        this.nomPap = answers[i].content.split(";", 3)
      }
      if(answers[i].content === "Membre de ménage" || answers[i].content === "Membre(s) du ménage"){
        this.auditService.getSubAnswersByAnswersId(Number(answers[i].id)).subscribe(res => {(
          this.Subanswers.push(res.body || []) ,
            this.subAnswerIndex = this.subAnswerIndex +1,
            this.menageNames(this.Subanswers, this.subAnswerIndex)
        )})
      }

      let notsorted : any
      if(answers[i].questionId === 88){
        this.auditService.getSubAnswersByAnswersId(Number(answers[i].id)).subscribe(res => {(
           notsorted = res.body,
          notsorted.sort((a, b) => a.questionCode.localeCompare(b.questionCode)),
          this.bienTouchee.push(notsorted || [])
        )})
      }
    }
  }

  menageNames(subanswers, index){
    let prénom =""
    let nom = ""
    for(let i = 0 ; i< subanswers.length; i++){
      for(let j = 0 ; j<subanswers[i].length; j++){
        if(subanswers[i][j].questionContent ==="Prénom"){
          prénom =subanswers[i][j].responseContent
        }

        if(subanswers[i][j].questionContent ==="Nom"){
          nom =subanswers[i][j].responseContent
        }
      }
    }
    this.menageNameList.push(prénom.concat(" " + nom))
  }

  sortQuestions(questions : any){
    var sortedArray: any = questions.sort((obj1, obj2) => {
      if (obj1.order > obj2.order) {
        return 1;
      }
      if (obj1.order < obj2.order) {
        return -1;
      }
      return 0;
    });
    this.questions.push(sortedArray)

  }

  formClosed(i : number): boolean{
    for(let j of this.valueclosed.keys()){
      if (i === this.valueclosed[j]){
        return true
      }
    }
    return false
  }


  closeList(j : number){
    const list = document.getElementById("group" + j.toString()) ;
    //as HTMLElement;
    list.style.display = 'none'
    this.closed = true
    this.valueclosed.push(j)
  }

  openList(j: number){
    const list = document.getElementById("group" + j.toString()) ;
    //as HTMLElement;
    list.style.display = 'block'
    this.closed = false
    this.valueclosed.forEach((element,index)=>{
      if(element==j) this.valueclosed.splice(index,1);
    });
  }



  goToAudit(){
    this.router.navigateByUrl('/audit');
  }

  retreiveAction() {
    const id = this.route.snapshot.paramMap.get('id');
    this.selectedAction =  this.service.getAuditActionById(id);
    }


  createImageFromBlob(image: Blob) {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      this.imageToShow = reader.result;
    }, false);

    if (image) {
      reader.readAsDataURL(image);
    }
  }


  retreiveAction2() {
    const id = this.route.snapshot.paramMap.get('id');
    this.selectedAction =  this.service.getAuditActionById2(id).subscribe(
      (resp) => {
        this.selectedAction = resp;
        });
}


  modify(i : number){

    let hideElement = document.getElementById(i.toString()) as HTMLElement;
    let showInputElement = document.getElementById(i.toString() + "Change") as HTMLSelectElement;
    hideElement.style.display ='none'
    showInputElement.style.display ='block'
  }

  hideButton(i : number){
    let hideElement = document.getElementById("Button" + i.toString()) as HTMLSelectElement;
    let showInputElement = document.getElementById("ButtonChange" + i.toString()) as HTMLSelectElement;
    hideElement.style.display ='none'
    showInputElement.style.display ='block'
  }

  post(i : number, questionId : number){
    let inputElement = document.getElementById("inputButton" + i.toString() ) as HTMLSelectElement;
    const enqueteId = this.route.snapshot.paramMap.get('id');

    if(inputElement.value !== null && inputElement.value !== undefined && inputElement.value !== "")
      swal.fire({
        title: 'Are you sure?',
        text: "You're updating the answer!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        reverseButtons: true,
      })
        .then((update) => {
          if (update) {
            this.service
              .createAnswer({
                content:inputElement.value,
                enquete:enqueteId,
                question:questionId,
              }).subscribe(
              (res: any) => {
                let hideElement = document.getElementById("ButtonChange" + i.toString()) as HTMLSelectElement;
                hideElement.style.display ='none'

                this.auditService.getCodeAnswersbyEnqueteId(Number(enqueteId)).subscribe(res => {(
                  this.answers = res.body || [],
                    this.Pap(this.answers)
                )})

                swal.fire("Nice! Your answer has been saved!","",
                  "success",
                );
              },
              err => {
                this.toastr.error('Error ', 'Saving answer failed.');
                console.log(err);
              },
            )
          }
        });

  }

  generalModified(i : number , id : any){
    let inputElement = document.getElementById("input" + i.toString() ) as HTMLSelectElement;
    id.content = inputElement.value

    if(inputElement.value !== null && inputElement.value !== undefined && inputElement.value !== "")
    swal.fire({
      title: 'Are you sure?',
      text: "You're updating the answer!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true,
    })
      .then((update) => {
        if (update) {
          console.log(id)
          this.service.updateAnswer(id).subscribe(
            (res: any) => {
              let hideElement = document.getElementById(i.toString() + "Change") as HTMLSelectElement;
              let showInputElement = document.getElementById(i.toString()) as HTMLElement;
              hideElement.style.display ='none'
              showInputElement.style.display ='block'

              swal.fire("Nice! Your answer has been updated!","",
                "success",
              );
            },
            err => {
              this.toastr.error('Error ', 'Updating answer failed.');
              console.log(err);
            },
          )
        }
      });
  }

  modifyMenage(i : number , j:number){
    let hideElement = document.getElementById(i.toString() + "," +  j.toString()) as HTMLElement;
    let showInputElement = document.getElementById(i.toString() + "," +  j.toString() + "Change") as HTMLSelectElement;
    hideElement.style.display ='none'
    showInputElement.style.display ='block'
  }

  menageModified(i : number , j:number, subanswer : any){
    let inputElement = document.getElementById("input" + i.toString() + "," +  j.toString() ) as HTMLSelectElement;
    subanswer.responseContent = inputElement.value

    if(inputElement.value !== null && inputElement.value !== undefined && inputElement.value !== "")
      swal.fire({
        title: 'Are you sure?',
        text: "You're updating the answer!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        reverseButtons: true,
      })
        .then((update) => {
          if (update) {
            console.log(subanswer)
            this.service.updateSubAnswer(subanswer).subscribe(
              (res: any) => {
                let hideElement = document.getElementById(i.toString() + "," +  j.toString() + "Change") as HTMLSelectElement;
                let showInputElement = document.getElementById(i.toString() + "," +  j.toString()) as HTMLElement;
                hideElement.style.display ='none'
                showInputElement.style.display ='block'

                swal.fire("Nice! Your answer has been updated!","",
                  "success",
                );
              },
              err => {
                this.toastr.error('Error ', 'Updating answer failed.');
                console.log(err);
              },
            )
          }
        });

  }

  modifyPap(i : string ){
    let hideElement = document.getElementById(i) as HTMLElement;
    let showInputElement = document.getElementById(i + "Change") as HTMLSelectElement;
    hideElement.style.display ='none'
    showInputElement.style.display ='block'
  }

  papModified(i : string ){
    for (let j = 0 ; j< this.answers.length ; j++){
    if(this.answers[j].questionId === 48){
      this.modifyContentPap = this.answers[j]
      let nomPap = this.answers[j].content.split(";", 3)
      let inputElement = document.getElementById( "input" + i ) as HTMLSelectElement;

      if(i === "nom"){
        nomPap[0] = inputElement.value
      }
      else if(i === "prenom"){
        nomPap[1] = inputElement.value
      }
      else{
        nomPap[2] = inputElement.value
      }

      this.modifyContentPap.content = nomPap[0].concat(";" + nomPap[1] + ";" + nomPap[2])
      console.log(this.modifyContentPap)
    }
    }

    let inputElement = document.getElementById( "input" + i ) as HTMLSelectElement;

    if(inputElement.value !== null && inputElement.value !== undefined && inputElement.value !== "")
      swal.fire({
        title: 'Are you sure?',
        text: "You're updating the answer!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        reverseButtons: true,
      })
        .then((update) => {
          if (update) {
            this.service.updateAnswer(this.modifyContentPap).subscribe(
              (res: any) => {

                let hideElement = document.getElementById(i + "Change") as HTMLSelectElement;
                let showInputElement = document.getElementById(i) as HTMLElement;
                hideElement.style.display ='none'
                showInputElement.style.display ='block'
                this.Pap(this.answers)


                swal.fire("Nice! Your answer has been updated!","",
                  "success",
                );
              },
              err => {
                this.toastr.error('Error ', 'Updating answer failed.');
                console.log(err);
              },
            )
          }
        });
  }

  validate(){
    const id = this.route.snapshot.paramMap.get('id');

    swal.fire({
      title: 'Are you sure?',
      text: "You're validating the investigation!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true,
    })
      .then((update) => {
        if (update) {
          this.service.validate(id).subscribe(
            (res: any) => {
              this.enquete = res || []
              swal.fire("Nice! Your investigation has been validated!","",
                "success",
              );
            },
            err => {
              this.toastr.error('Error ', 'Validation failed.');
              console.log(err);
            },
          )
        }
      });
  }

  doubleValidate(){
    const id = this.route.snapshot.paramMap.get('id');

    swal.fire({
      title: 'Are you sure?',
      text: "You're validating the investigation!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
      reverseButtons: true,
    })
      .then((update) => {
        if (update) {
          this.service.doubleValidate(id).subscribe(
            (res: any) => {
              this.enquete = res || []
              swal.fire("Nice! Your investigation has been validated!","",
                "success",
              );
            },
            err => {
              this.toastr.error('Error ', 'Validation failed.');
              console.log(err);
            },
          )
        }
      });
  }


  onLogout() {
    localStorage.removeItem('token');
    localStorage.clear();
    this.router.navigate(['/user/login']);
  }
}
