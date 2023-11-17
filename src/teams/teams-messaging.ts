import axios from "axios";

export class TeamsMessaging { 
    
    //--------------EXECUTABLE PART OF THE COMMAND----------------------
    main(webhook: string, platform_ident:string, artifact_link: string, isSuccessfull: boolean){ 
        
        //very basic sanity check for the urls
        if(! this.sanity_check_urls_ok([webhook, platform_ident])){
            console.log("A given Url is not a valid url.");
        }
        
        //modifying according to status of the buid
        var statusString ="Successful";
        if(!isSuccessfull){
            statusString = "Failed";        
        }

        //creating message contents
        const data={
            title: "New "+statusString.toUpperCase()+" codemagic build - "+platform_ident.toUpperCase() ,
            summary: statusString.toUpperCase()+" build - "+platform_ident.toUpperCase() ,
            text: this.getTextTeamsMsg(isSuccessfull),
            potentialAction: [
                {
                    "@type": "OpenUri",
                    name: "Download Artifact",
                    targets: [{ os: "default", uri: artifact_link }]
                }
            ]
        };
        
        //posting the actual message
        axios.post(webhook,data);
        return ; 
    }

    private getTextTeamsMsg(isSuccessfull:boolean){
        if(isSuccessfull){
            return "The newly released version did build and is now available as an artifact.";
        }else{
            return "The newly released version did NOT build and the logs now available as an artifact.";
        }
    }
    

    //--------------YARGS CONFIGURATION OF THE COMMAND-------------------
    // define the command line options needed for the teams command  
    public addTeamsCommandArguments(args: any){
        return args.option({'webhook': {description: 'the webhook of the teams channel that shall receive the message', required: true, type: 'string'},
                           'platform': {description: 'identifier of the platform, for which the build was created [ios/android]', required: true, type: 'string'},
                           'artifact_url': {description: 'download link for the created artifact', required: true, type: 'string'},
                           'was_build_successful': {description: 'status of the finished build', required: true, type: 'boolean'}});
    }

    //--------------HELPER METHODS--------------------------------------
    private sanity_check_urls_ok(urls: string[]):boolean{
        for (var urlToCheck in urls){
            try {
                new URL(urlToCheck);
            } catch (err) {
                return false;
            }
        }
        return false;
    }
} 