import { HttpClient, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { EventEmitter, Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";
import { User } from "./user/user.model";
import { ViewUser } from "./user/view-user.model";
import {catchError} from 'rxjs/operators';
import { throwError } from "rxjs";
import {tap} from 'rxjs/operators';
import { environment } from "src/environments/environment.prod";

@Injectable({providedIn: 'root'})
export class AuthService{
    userDetail = new Subject<ViewUser | null>();
    selectedValue = new EventEmitter<string>();
    userId = new Subject<string | null>();
    userOtp : string;
    //uri:string = "https://localhost:44396/";
    //uri:string = "https://comtweetapp.azurewebsites.net/";
    uri:string = environment.uri;
    constructor(private http: HttpClient){}

    signUp(userDetail: User){
        return this.http.post(this.uri + 'api/v1.0/tweets/register', userDetail);
    }

    login(emailId: string, password: string){
        return this.http.post<ViewUser>(this.uri +'api/v1.0/tweets/login', {
            emailId: emailId,
            password: password
        }).pipe( catchError(this.handleError), tap(responseData => {
            const user = new ViewUser(
                responseData.emailId, 
                responseData.dateOfBirth, 
                responseData.gender, 
                responseData.firstName, 
                responseData.lastName);
            this.userDetail.next(user);
            localStorage.setItem('user', user.emailId);
            localStorage.setItem('gender',user.gender);
        }));
    }

    isLoggedIn(){
        return localStorage.getItem('user') ? true : false;
    }

    logout(){
        this.userDetail.next(null);
        localStorage.clear();
    }

    SecurityCheckValidation(emailId: string, question: number, answer: string){
        return this.http.put<boolean>(this.uri+'api/v1.0/tweets/forgot', {
            emailId : emailId,
            securityQuestion: question,
            securityAnswer: answer
        });
    }

    resetPassword(userId: string, newPassword: string){
        return this.http.put<boolean>(this.uri+'api/v1.0/tweets/resetPassword/'+userId,
        {
            oldPassword: "Some random value!",
            newPassword: newPassword
        });
    }

    mailSend(userId:string){
       return this.http.get<any>(this.uri+'api/v1.0/tweets/users/mail/'+ userId).subscribe((data)=>{
           this.userOtp = data;
           localStorage.setItem('userOtp',this.userOtp);
       });
    }
    
    private handleError(errorRes: HttpErrorResponse){
        console.log(errorRes); 
        let errorMessage = 'An internal server error occurred!';

        if(!errorRes.error || !errorRes.error.errorMessage){
            return throwError(errorMessage);
        }
        errorMessage = errorRes.error.errorMessage;
        return throwError(errorMessage);
    }
}