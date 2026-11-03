const MESSAGE='do-it-connection-test';
export function validProjectId(value){return /^[a-z][a-z0-9-]{4,28}[a-z0-9]$/.test(value)}
export async function probeFirestore(projectId,{fetcher=fetch,emit=()=>{},probeId,timeoutMs=12000}={}){
 if(!validProjectId(projectId))throw Error('Нужен ID проекта: 6–30 строчных латинских букв, цифр и дефисов.');
 const id=probeId??Array.from(crypto.getRandomValues(new Uint8Array(8)),x=>x.toString(16).padStart(2,'0')).join('');
 if(!/^[a-f0-9]{16}$/.test(id))throw Error('Некорректный идентификатор проверки');
 const url=`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/connection_test/github_${id}`;
 async function call(label,method,target,body,accepted=[200]){
  const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),timeoutMs);
  const start=performance.now();emit({label,state:'running'});
  try{
   const response=await fetcher(target,{method,credentials:'omit',cache:'no-store',signal:controller.signal,...(body?{headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:{})});
   const raw=await response.text();let data;try{data=JSON.parse(raw)}catch{}
   const ms=Math.round(performance.now()-start);
   if(!accepted.includes(response.status)){
    const detail=data?.error?.message??(data?'Неожиданный ответ API':'Получен ответ не в формате JSON; возможен ответ сетевого фильтра.');
    const error=Error(`HTTP ${response.status}: ${detail}`);error.status=response.status;throw error;
   }
   emit({label,state:'passed',detail:`HTTP ${response.status} · ${ms} мс`});return data;
  }catch(error){emit({label,state:'failed',detail:error.name==='AbortError'?'Истекло время ожидания':error.message});throw error}
  finally{clearTimeout(timer)}
 }
 let primaryError=null,cleanupError=null;
 try{
  await call('Запись временного документа','PATCH',url+'?currentDocument.exists=false',{fields:{message:{stringValue:MESSAGE}}});
  const read=await call('Чтение документа','GET',url);
  if(read?.fields?.message?.stringValue!==MESSAGE)throw Error('Содержимое прочитанного документа не совпало с проверочным.');
 }catch(error){primaryError=error}
 finally{
  // Clean only this newly generated probe, including uncertain network outcomes.
  try{
   await call('Удаление временного документа','DELETE',url,undefined,[200,404]);
   await call('Подтверждение удаления','GET',url,undefined,[404]);
  }catch(error){cleanupError=error}
 }
 if(primaryError||cleanupError){
  const error=primaryError??cleanupError;
  if(cleanupError)error.cleanupFailed=true;
  throw error;
 }
 return {ok:true};
}
