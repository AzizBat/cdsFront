import {Component, OnDestroy, OnInit} from '@angular/core';
import {TranslateService} from "@ngx-translate/core";
import {FormBuilder, Validators} from "@angular/forms";
import {AppService} from "./app.service";
import {Subject} from "rxjs";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy  {
  title = 'cds';
  anonymous = true;
  divName =""

  matricule : any
  password : any
  newPassword : any
  error = '';
  success :any;
  checkType : any;
  subCheckType : any;
  checklists : any
  checklist : any
  checklistQuestions : any = []
  response : any = []
  order = 0
  user : any
  page = 'home'
  selectedLanguage = ''
  type = ''
  checklistQuestion = ''
  oldChecklistQuestion = ''
  oldAnswerType = ''
  answerType = ''
  homeDisplay = false
  message = false
  answer: string | undefined;

  private onDestroy$ = new Subject<void>();

  constructor(
    private translate: TranslateService,
    private service: AppService,
    protected fb: FormBuilder
  ) {}

  ngOnInit() {
  }

  ngOnDestroy() {
    this.onDestroy$.next(); // Emit a signal to unsubscribe from observables
    this.onDestroy$.complete(); // Complete the observable to release resources
  }


  startInactivityTimer() {
    const inactivityTime = 5 * 60 * 1000; // 5 minutes in milliseconds

    let timeoutId: number;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => this.finish(), inactivityTime);
    };

    const onUserActivity = () => {
      resetTimeout();
    };

    const removeActivityListeners = () => {
      document.removeEventListener('mousemove', onUserActivity);
      document.removeEventListener('mousedown', onUserActivity);
      document.removeEventListener('keypress', onUserActivity);
      document.removeEventListener('touchstart', onUserActivity);
    };

    document.addEventListener('mousemove', onUserActivity);
    document.addEventListener('mousedown', onUserActivity);
    document.addEventListener('keypress', onUserActivity);
    document.addEventListener('touchstart', onUserActivity);

    resetTimeout();

    // Clean up the activity listeners when the component is destroyed
    this.onDestroy$.subscribe(() => {
      clearTimeout(timeoutId);
      removeActivityListeners();
    });
  }




  selectLanguage(selectedLanguage : string){
    this.homeDisplay = true
    this.startInactivityTimer();
    let language = document.getElementById('language') as HTMLButtonElement;
    let languageQuestion = document.getElementById('languageQuestion') as HTMLElement;
    let login = document.getElementById('login') as HTMLButtonElement;
    let home = document.getElementById('home') as HTMLElement;
    language.style.display = "none"
    languageQuestion.style.display = "none"
    login.style.removeProperty( 'display' );
    home.style.removeProperty( 'display' );
    this.translate.use(selectedLanguage);
    this.selectedLanguage =selectedLanguage
    console.log(this.translate)
    this.page = 'selectLogin'
  }

  login(){
    let login = document.getElementById('login') as HTMLButtonElement;
    let login2 = document.getElementById('login2') as HTMLButtonElement;
    login.style.display = "none"
    login2.style.removeProperty( 'display' );
    this.page='loginPage'
  }

  signIn(type: string){
    this.page = 'checklistPage'
    this.type =type
    if(type === "Authentified"){
      this.anonymous =false

      let matricule = document.getElementById('matricule') as HTMLInputElement;
      let password = document.getElementById('password') as HTMLInputElement;

      this.matricule = matricule.value
      this.password =password.value

      this.service.loginMatricule(this.createFromForm())
        .subscribe(
          (res: any) => {
            localStorage.setItem('token', res.accessToken);
            localStorage.setItem('curUser', JSON.stringify(res.user) );
            this.user = res.user

            this.service.getChecklists("All").subscribe(res1 => {(
              this.checklists = res1 || [])
              console.log(this.checklists)
            })


            let login2 = document.getElementById('login2') as HTMLButtonElement;
            let answer = document.getElementById('answer') as HTMLElement;

            login2.style.display = "none"
            answer.style.removeProperty( 'display' );

            },
      _error => {
        this.error = 'Matricule ou mot de passe incorrect';
        // this.loading = false;
      })

    }
    else{
      this.service.getChecklists("Anonymous").subscribe(res1 => {(
        this.checklists = res1 || [])
      })

      let login = document.getElementById('login') as HTMLButtonElement;
      login.style.display = "none"

      let login2 = document.getElementById('login2') as HTMLButtonElement;
      let answer = document.getElementById('answer') as HTMLElement;

      login2.style.display = "none"
      answer.style.removeProperty( 'display' );
    }

  }

  getQuestions(id : number, order : number){
    this.page = 'questionsPage'
    for (let i = 0 ; i< this.checklists.length ; i++){
      if(id === this.checklists[i].id){
        this.checklist = this.checklists[i]
      }
    }
    this.checklist.checklistQuestions.sort((a:any, b:any) => a.id - b.id);

    console.log(this.checklist)
    this.order = this.order +1

    let answer = document.getElementById('answer') as HTMLElement;
    let buttons = document.getElementById('buttons') as HTMLButtonElement;
    let text = document.getElementById('text') as HTMLButtonElement;
    let emoji = document.getElementById('emoji') as HTMLButtonElement;
    answer.style.display = "none"
    if(this.checklist.checklistQuestions[0].answerType ==='BUTTONS') {
      buttons.style.removeProperty('display');
    }
    if(this.checklist.checklistQuestions[0].answerType ==='TEXT') {
      text.style.removeProperty('display');
    }
    if(this.checklist.checklistQuestions[0].answerType ==='EMOJI') {
      emoji.style.removeProperty('display');
    }
  }

  getAfter(id : number, order : number, checklistQuestion :string, answerType : string, back : boolean, response : string){
    console.log(checklistQuestion)
    if(back){
      checklistQuestion = this.checklistQuestion
      answerType = this.answerType
    }
    this.oldChecklistQuestion = this.checklistQuestion
    this.checklistQuestion = checklistQuestion
    this.oldAnswerType = this.answerType
    this.answerType = answerType
    // displaying
    let buttons = document.getElementById('buttons') as HTMLButtonElement;
    let text = document.getElementById('text') as HTMLButtonElement;
    let emoji = document.getElementById('emoji') as HTMLButtonElement;
    let buttons1 = document.getElementById('buttons1') as HTMLButtonElement;
    let text1 = document.getElementById('text1') as HTMLButtonElement;
    // let emoji1 = document.getElementById('emoji1') as HTMLButtonElement;
    buttons.style.display = "none"
    text.style.display = "none"
    emoji.style.display = "none"
    buttons1.style.removeProperty( 'display' );
    text1.style.removeProperty( 'display' );
    // emoji1.style.removeProperty( 'display' );


    // get response
    let answer = ""
    if(back === false) {
      if (answerType === "BUTTONS" || answerType === "EMOJI") {
        answer = response
      } else {

        if (this.order === 1) {
          let input = document.getElementById('textArea') as HTMLTextAreaElement;
          console.log(input.value)
          if (!this.answer || this.answer.trim() === "") {
            this.message = true
          } else {
            answer = input.value
            this.message = false
          }
        } else {
          let input = document.getElementById('textArea1') as HTMLTextAreaElement;
          console.log(input.value)

          if (input.value === null || input.value === undefined || input.value === "") {
            this.message = true
          } else {
            answer = input.value
            this.message = false
          }
        }
      }
      console.log(this.message)


      if (this.message === false) {
        this.response.push({answer: answer, answerType: answerType})
        console.log(this.response)


        //go to next question
        this.checklistQuestions = []
        this.order = this.order + 1
        for (let i = 0; i < this.checklist.checklistQuestions.length; i++) {
          if (this.order > 1) {
            if (this.checklist.checklistQuestions[i].translator === checklistQuestion && this.checklist.checklistQuestions[i].questionOrder === this.order) {
              this.checklistQuestions.push(this.checklist.checklistQuestions[i])
            }
          } else {
            if (this.checklist.checklistQuestions[i].questionOrder === this.order) {
              this.checklistQuestions.push(this.checklist.checklistQuestions[i])
            }
          }
        }
        this.checklistQuestions.sort((a: any, b: any) => a.id - b.id);


        // save & go to message
        if (this.checklistQuestions.length === 0) {


          // this.service.saveRequest(this.saveRequestForm())
          //   .subscribe(
          //     (res: any) => {
          //       this.success = res
          //     },
          //     _error => {
          //       this.error = 'Matricule ou mot de passe incorrect';
          //       // this.loading = false;
          //     })

          let thankYou = document.getElementById('thankYou') as HTMLElement;
          let finish = document.getElementById('finish') as HTMLElement;
          let home = document.getElementById('home') as HTMLElement;


          buttons1.style.display = "none"
          text1.style.display = "none"
          emoji.style.display = "none"
          home.style.display = "none"
          thankYou.style.removeProperty('display');
          finish.style.removeProperty('display');
          this.homeDisplay = false
        }
      }
    }
  }


  anomalyWorkflow(){
    let answer = document.getElementById('answer') as HTMLElement;
    let anomalyAnswers = document.getElementById('anomalyAnswers') as HTMLButtonElement;
    answer.style.display = "none"
    anomalyAnswers.style.removeProperty( 'display' );
    this.subCheckType = "anomaly"
  }

  description(id:string, checktype : string){
    this.checkType = checktype

    let answer = document.getElementById('answer') as HTMLElement;
    let anomalyAnswers = document.getElementById('anomalyAnswers') as HTMLButtonElement;
    let description = document.getElementById('description') as HTMLButtonElement;
    let descriptionName = document.getElementById('descriptionName') as HTMLButtonElement;
    answer.style.display = "none"
    anomalyAnswers.style.display = "none"
    description.style.removeProperty( 'display' );
    descriptionName.style.removeProperty( 'display' );
    this.divName = id
  }

  emotion(){
    let answer = document.getElementById('answer') as HTMLElement;
    let emotionAnswers = document.getElementById('emotionAnswers') as HTMLButtonElement;
    answer.style.display = "none"
    emotionAnswers.style.removeProperty( 'display' );
  }

  thankYou(){
    let emotionAnswers = document.getElementById('emotionAnswers') as HTMLButtonElement;
    let description = document.getElementById('description') as HTMLButtonElement;
    let descriptionName = document.getElementById('descriptionName') as HTMLButtonElement;
    let thankYou = document.getElementById('thankYou') as HTMLElement;
    let finish = document.getElementById('finish') as HTMLElement;

    emotionAnswers.style.display = "none"
    description.style.display = "none"
    descriptionName.style.display = "none"
    thankYou.style.removeProperty( 'display' );
    finish.style.removeProperty( 'display' );
  }

  finish(){
    location.reload()
  }



  protected createFromForm() {
     return {
      matricule: Number(this.matricule),
      password: this.password
    };
  }

  protected changePasswordForm() {
    return {
      email: this.matricule,
      password: this.password,
      newPassword: this.newPassword
    };
  }

  protected saveRequestForm() {
    return {
      requester: this.user,
      anonymous: this.anonymous,
      requestType : this.checklist,
      feedback : false,
      requestAnswers : this.response
    };
  }

  goBack(){
    if(this.page ==='selectLogin'){
      this.finish()
    }
    if(this.page === 'loginPage'){
      let login2 = document.getElementById('login2') as HTMLButtonElement;
      login2.style.display ='none'
      this.selectLanguage(this.selectedLanguage)
    }
    if(this.page=== 'checklistPage'){
      let answer = document.getElementById('answer') as HTMLElement;
      answer.style.display ='none'
      if(this.anonymous === true){
        this.selectLanguage(this.selectedLanguage)
      }
      else{
        let login2 = document.getElementById('login2') as HTMLButtonElement;
        login2.style.removeProperty('display')
      }
    }

    if(this.page === 'questionsPage'){
      if(this.order ===1){
        this.order =0
        let answer = document.getElementById('answer') as HTMLElement;
        let buttons = document.getElementById('buttons') as HTMLButtonElement;
        let text = document.getElementById('text') as HTMLButtonElement;
        let emoji = document.getElementById('emoji') as HTMLButtonElement;
        buttons.style.display = "none"
        text.style.display = "none"
        emoji.style.display = "none"
        answer.style.removeProperty( 'display' );
      }
      else{
        this.order = this.order -2
        this.response.pop()
        console.log(this.oldChecklistQuestion)
        this.getAfter(this.checklist.id , this.order, this.oldChecklistQuestion,this.oldAnswerType, true, 'nothing' )
      }
    }
  }

  changePassword(){
    let login2 = document.getElementById('login2') as HTMLButtonElement;
    let changePw = document.getElementById('changePw') as HTMLButtonElement;
    login2.style.display = "none"
    changePw.style.removeProperty( 'display' );
    this.page='changePasswordPage'
  }

  changingPassword(){
    let matricule = document.getElementById('matricule1') as HTMLInputElement;
    let password = document.getElementById('password1') as HTMLInputElement;
    let newPassword = document.getElementById('newPassword') as HTMLInputElement;

    this.matricule = matricule.value
    this.password =password.value
    this.newPassword =newPassword.value

    this.service.changePassword(this.changePasswordForm())
      .subscribe(
        (res: any) => {
          this.user = res.user
          this.finish()

        },
        _error => {
          this.error = 'Matricule ou mot de passe incorrect';
          // this.loading = false;
        })

  }

}
