/**
 * Proof of Concept
 * When using promise.all([promiselist]), all promises will be executed simultaniously.
 * 
 * PromiseChain makes it easy to dynamically chain dependent promises, using a similar injection structure as promise.all()
 * Useful in cases where the promise-chain can dynamically differ depending on certain situations
 */         

/*
Examples: 
    const promiseChain=new PromiseChain([
        ["person",(personId:string)=>personService.getPersonById(personId)],  // Will return a Person
        ["company",(person:Person)=>promiseProvider.getCompany(person)], // Will receive person and return / pass a compound object
        ["assets",(compound:PersonCompoundResult)=>promiseProvider.getAssets(compound)] // Will receive the company compount object and return / pass an assets compound object
    ]);
    return promiseChain.run(personId)


    // Same chain as initializeNormalChain, but using the PromiseChain
    const promiseChain=new PromiseChain();
    promiseChain.addPromise("person",(personId:string)=>personService.getPersonById(personId)); 
    promiseChain.addPromise("company",(perosn:Person)=>promiseProvider.getCompany(perosn)); 
    promiseChain.addPromise("assets",(compound:PersonCompoundResult)=>promiseProvider.getAssets(compound)); 
    return promiseChain.run(personId)

*/
export class PromiseChain{

    private promiseMethodChain:Map<string,Function>=new Map();

    constructor(promiseMethodList:Iterable<[string,Function]>=[]){  
        // Iteraring the map will return the individual promises in the same order as they were inserted
        // If a promise has an overlapping key, that promise will override that other promise 
        // and the chain will produce unexpected result    
        this.promiseMethodChain=new Map(promiseMethodList);
    }

    /**
     * Adds a promise to the chain. Input will be the output of the previous promise
     * Key needs to be unique, otherwise the promise will be added at the wrong spot in the chain
     * 
     * @param key 
     * @param value 
     */
    public addPromise(key:string, value:Function){
        this.promiseMethodChain.set(key,value);
    }

    /**
     * The input is the input for the first promise
     * The rest is produced and passed by the chain.
     * Run will return the last promise in the chain
     * That specific last promise returns a PromiseChainResult
     * 
     * @param firstInput is any value used as input for the first promise creator
     */

    public run(firstInput:any):Promise<PromiseChainResult>{

        // Variables to build the chain
        let previousStep=null;
        let referenceKey="";

        // As with the promise.all method, we like to have a collection with the results in the chain, in the order of execution
        const resultCollection=new Map();

        // We need a final step to close the process and return the final result and the collection of all results 
        const finalStep=(result)=>{
            // Add the final promise, that will return the end result
            return new Promise((resolve,reject)=>{
                resolve({result,resultCollection});
            } )           
        }

        // Build chain
        this.promiseMethodChain.forEach((promiseProvider:Function,promiseReference:string)=>{

            if(previousStep){
                // Start building the chain
                previousStep=this.createStep(previousStep,promiseProvider,referenceKey,resultCollection);
            }else{
                // Create first promise
                previousStep=promiseProvider(firstInput);
            } 

            // We use the promise reference in the next promise, where we will get the result
            referenceKey=promiseReference;      
        })

        // Create and return final step in the chain
        return this.createStep(previousStep,finalStep,referenceKey,resultCollection);
    }

    private createStep(previousPromise:Promise<any>, promiseProvider:Function, referenceKey:string, resultCollection:Map<string,any>){
       
            // Start building the chain
            return previousPromise.then((result)=>{
                
                // Add result to collection, under key of previous round
                resultCollection.set(referenceKey,result);

                // Instantiate and execute next promise
                return promiseProvider(result);
            }); 
       
    }

}
/**
 * 
 */
export class PromiseChainResult{
    result:any;
    resultCollection:any[];
}