import { Component } from '@angular/core';
import { Http } from '@angular/http';
import { Project } from './project';
import { Option } from './option';
import { CustomOption } from './option';
import { OptionType } from './option';
import { DataService } from './data.service';
import { RandomHelper } from './random-helper';
import { OnInit } from '@angular/core';
import { ModalComponent } from './modal.component';

@Component({
  selector: 'app-root',
  templateUrl: './letter-builder.component.html',
  styleUrls: ['./letter-builder.component.css'],
  providers: [DataService]
})

export class LetterBuilderComponent {
  constructor(private dataService: DataService, private http: Http) { }
  project: Project
  relationships: Option[]
  customRelationship: string
  supportReasons: Option[]
  customSupportReasons: CustomOption[]
  improvements: Option[]
  customImprovements: CustomOption[]
  name: string = '';
  emailAddress: string ='';
  physicalAddress: string = '';
  letterSubject: string = '';
  letterBody: string = '';
  joinMailingList: boolean = false;
  dataLoaded: boolean = false;
  letterSent: boolean = false;
  demoMode: boolean = false;

  //text for display
  sendLetterButtonText: string = 'Send Letter';
  messageSentModalDialogHeader: string = '';
  messageSentModalDialogBody: string = '';

  ngOnInit(): void {
    this.dataService.init(() => {
      var projectId = this.getQueryParams(location.search)['p'];
      var proj = this.dataService.getProject(projectId);
      if(proj == null)
        this.project = new Project('404', '404', 'nobody@nowhere.com', '404','Project not found',[]);
      else
        this.project = this.dataService.getProject(projectId);

      this.relationships = this.getApplicableOptionsForProject(this.project, this.dataService.getOptions(OptionType.Relationship));
      this.supportReasons = this.getApplicableOptionsForProject(this.project, this.dataService.getOptions(OptionType.SupportReason));
      this.customSupportReasons = [];
      this.improvements = this.getApplicableOptionsForProject(this.project, this.dataService.getOptions(OptionType.Improvement));
      this.customImprovements = [];
      this.dataLoaded = true;
      var queryParams = this.getQueryParams(location.search);
      if(queryParams['test'] == 'true')
        this.populateTestData();
      if(queryParams['demo'] == 'true')
        this.demoMode = true;  
    });
  }

  //make testing easier by prepopulating most fields with (nonsense) data
  populateTestData(): void {
    this.name = "Test McTesterson";
    this.emailAddress = "test@test.com"
    this.physicalAddress = "4567 Fake Street, Vancouver. V5T 0A1"
    for(let i = 0; i < 1; i++){
      this.relationships[RandomHelper.RandomIntInclusive(0,this.relationships.length - 1)].appliesToUser = true;
    }

    for(let i = 0; i < 2; i++){
      this.supportReasons[RandomHelper.RandomIntInclusive(0,this.supportReasons.length - 1)].appliesToUser = true;
    }

    for(let i = 0; i < 2; i++){
      this.improvements[RandomHelper.RandomIntInclusive(0,this.improvements.length - 1)].appliesToUser = true;
    }
  }

  generateText(): void {
    let bullet = this.dataService.getRandomBulletPoint();

    this.letterSubject = this.getTextFromBank('emailSubject');
    this.letterBody = '';
    this.addLine(this.getTextFromBank('firstLine'));
    this.addLineBreak();
    this.addSentence(this.getTextFromBank('openingSentence'));

    this.relationships.filter(function (r) { return r.appliesToUser; }).forEach(element => {
      this.addSentence(this.getTextFromBank(element.id));
    });
    if(this.customRelationship && this.customRelationship.trim() != '')
      this.addSentence(this.customRelationship);
    this.addLineBreak();
    this.addLineBreak();

    let applicableStandardSupportReasons = this.supportReasons.filter(function (r) { return r.appliesToUser; });
    if(applicableStandardSupportReasons.length > 0 || this.customSupportReasons.length > 0){
      this.addSentence(this.getTextFromBank('supportReasonIntroStart'));
      this.addLine(this.getTextFromBank('supportReasonIntroEnd'));
      applicableStandardSupportReasons.forEach(element => {
        this.addLineItem(bullet, this.getTextFromBank(element.id));
      });
      this.customSupportReasons.forEach( r => {
        this.addLineItem(bullet, r.text);
      });
      this.addLineBreak();
    }

    let applicableImprovementSuggestions = this.improvements.filter(function (r) { return r.appliesToUser; });
    if(applicableImprovementSuggestions.length > 0 || this.customImprovements.length > 0){
      this.addLine(this.getTextFromBank('improvementIntro'));
      applicableImprovementSuggestions.forEach(element => {
        this.addLineItem(bullet, this.getTextFromBank(element.id));
      });
      this.customImprovements.forEach( r => {
        this.addLineItem(bullet, r.text);
      });
      this.addLineBreak();
    }

    //don't always (ever?) need a closer...
    if(RandomHelper.FlipACoin()){
      this.addLine(this.getTextFromBank('closer'));
      this.addLineBreak();
    }

    this.addLine(this.getTextFromBank('valediction'));
    this.addText(this.name);
    if(this.physicalAddress && this.physicalAddress.trim() != '')
      this.addSentence('\n' + this.physicalAddress);
  }

  addLineBreak(): void{
    this.addLine('');
  }

  addLine(text: string): void {
    this.letterBody += text + '\n';
  }

  addLineItem(bullet:string, text: string): void {
    this.letterBody += bullet + ' ' + text + '\n';
  }

  addSentence(text: string): void{
    this.letterBody += text + ' ';
  }

  addText(text: string): void{
    this.letterBody += text;
  }

  replaceTokens(text: string): string{
    return text.replace('[projectName]', this.project.name)
               .replace('[neighbourhoodName]',this.project.neighbourhood);
  }

  getTextFromBank(id: string): string{
    return this.replaceTokens(this.dataService.getRandomTextBankEntry(id));
  }

  getApplicableOptionsForProject(project: Project, allOptions: Option[]): Option[] {
    var ret = allOptions.filter(function (r) { return r.tags.length === 0; });
    project.tags.forEach(tag => {
      var tagMatches = allOptions.filter(function (r) { return r.tags.includes(tag) });
      ret = ret.concat(tagMatches);
    });
    return ret;
  }

  getQueryParams(qs: string) : {} {
    // polyfill for IE
    // https://tc39.github.io/ecma262/#sec-array.prototype.includes
    if (!Array.prototype.includes) {
      Object.defineProperty(Array.prototype, 'includes', {
        value: function(searchElement, fromIndex) {
    
          // 1. Let O be ? ToObject(this value).
          if (this == null) {
            throw new TypeError('"this" is null or not defined');
          }
    
          var o = Object(this);
    
          // 2. Let len be ? ToLength(? Get(O, "length")).
          var len = o.length >>> 0;
    
          // 3. If len is 0, return false.
          if (len === 0) {
            return false;
          }
    
          // 4. Let n be ? ToInteger(fromIndex).
          //    (If fromIndex is undefined, this step produces the value 0.)
          var n = fromIndex | 0;
    
          // 5. If n ≥ 0, then
          //  a. Let k be n.
          // 6. Else n < 0,
          //  a. Let k be len + n.
          //  b. If k < 0, let k be 0.
          var k = Math.max(n >= 0 ? n : len - Math.abs(n), 0);
    
          function sameValueZero(x, y) {
            return x === y || (typeof x === 'number' && typeof y === 'number' && isNaN(x) && isNaN(y));
          }
    
          // 7. Repeat, while k < len
          while (k < len) {
            // a. Let elementK be the result of ? Get(O, ! ToString(k)).
            // b. If SameValueZero(searchElement, elementK) is true, return true.
            // c. Increase k by 1. 
            if (sameValueZero(o[k], searchElement)) {
              return true;
            }
            k++;
          }
  
          // 8. Return false
          return false;
        }
      });
    }

    qs = qs.split('+').join(' ');

    var params = {},
    tokens,
    re = /[?&]?([^=]+)=([^&]*)/g;

    while (tokens = re.exec(qs)) {
      params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
    }

    return params;
  }

  addCustomSupportReason(): void
  {
    this.customSupportReasons.push(new CustomOption(''));
  }

  addCustomImprovement(): void
  {
    this.customImprovements.push(new CustomOption(''));
  }

  //is there text that might be overwritten if the user generates a new letter? 
  warnAboutOverwrite(): boolean{
    return this.letterBody.trim() != '';
  }

  readyToSendLetter(): boolean{
    if(!this.letterSent && this.letterSubject && this.letterBody && this.letterSubject.trim() != '' && this.letterBody.trim() != '')
      return true;
    else
      return false;
  }

  sendLetter(): void {
    if (this.demoMode) {
      console.log('Demo mode, not sending letter')
      this.sendLetterSucceeded();
    }
    else {
      this.messageSentModalDialogHeader = 'Sending...';
      console.log('Posting letter')
      //todo: move this into config
      let url = "https://8zp8hsoa63.execute-api.us-west-2.amazonaws.com/prod/submit";
      let data = {};
      data['name'] = this.name;
      data['email'] = this.emailAddress;
      data['subject'] = this.letterSubject;
      data['content'] = this.letterBody;
      //data['join'] = this.joinMailingList;
      this.http.post(url, data)
      .map(response => response.json())
      .subscribe( () => {},
        err => {console.log(err); this.sendLetterFailed();},
        () => this.sendLetterSucceeded());
    }
    
  }

  sendLetterSucceeded(): void {
    console.log('Post complete');
    this.letterSent = true;
    this.sendLetterButtonText = "Letter sent";
    this.messageSentModalDialogHeader = 'All Done';
    this.messageSentModalDialogBody = 'Your letter has been added to the review queue and will be sent to council shortly. Thank you so much!';
  }

  sendLetterFailed(): void {
    console.log('Message failed to send');
    this.messageSentModalDialogHeader = "Message failed to send";
    this.messageSentModalDialogBody = "The message failed to send, sorry about that! Try again, and if it still doesn't work please let us know.";
  }


}
