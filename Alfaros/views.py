from django.shortcuts import render
from django.views.decorators.cache import cache_control
from django.contrib.auth.decorators import login_required
from .models import *
from django.db.models import Min
from io import BytesIO
from django.template.loader import get_template
import xhtml2pdf.pisa as pisa
from django.http import HttpResponse,HttpResponseRedirect,FileResponse
from django.core import serializers
import json
from django.contrib.auth import authenticate,login,logout
import requests
import time
from datetime import datetime
import threading
from threading import Thread
from django.views.decorators.csrf import csrf_exempt
import math

global rep, lock, z, track , lock_m , lock_t, update_t, lock_s, sleepy,tbreak,getall,rbreak
# rep = [{'time': datetime.strptime(datetime.now().strftime("%Y-%m-%d 23:59:59"),'%Y-%m-%d %H:%M:%S').timestamp(),
#         'schedule': 'daily',
#         'name': 'test_report',
#         'type': 'Default',
#         'owner': 'System',
#         'view': 'HTML & PDF',
#         'search': 'date>5'}]
rep=None
z = []
lock = threading.Lock()
lock_s = threading.Lock()
lock_t = threading.Lock()
lock_m = threading.Lock()
sleepy = []
track = []
update_t = []
tbreak=0
getall=0
rbreak=0

def start_new_thread(function):
    def decorator(*args, **kwargs):
        t = Thread(target=function, args=args, kwargs=kwargs)
        t.daemon = True
        t.start()
    return decorator


@start_new_thread
def retrieve_alerts():
    f = open('alertid', 'r')
    x = f.read()
    increment = int(x)
    f.close()

    k = open('oldalertid', 'w+')
    k.write(str(increment))
    k.close()
    print(increment)
    while True:
        print(increment)
        while True:
            try:
                r = requests.get("http://10.220.10.8/api/bec/alerts/" + str(increment), headers={"Cookie": "JSESSIONID=D8CCE32CDFFF40309300CCE5236793E3"})
            except :
                print('NO CONNECTION !! ')
                print('Sleeping 60 seconds')
                time.sleep(60)
                continue
            break
        while r.status_code != 200:
            time.sleep(1)
            r = requests.get("http://10.220.10.8:8080/api/bec/alerts/" + str(increment),
                             headers={"Cookie": "JSESSIONID=D8CCE32CDFFF40309300CCE5236793E3"})
        if r.text.find('"type":"InternalRuleFired"') > -1:
            js_data = json.loads(r.text)
            threading.Thread(name="s_handler", target=severity_handler, args=(js_data,)).start()
        increment += 1
        f = open('alertid', 'w+')
        f.write(str(increment))
        f.close()


@login_required(login_url='/login/')
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def Dashboard(request):
    request.session.set_expiry(0)
    context = {'alerts':alerts.objects.all()[:10]}
    return render(request, 'Dashboard.html', context)


@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url='/login/')
def analytics(request):
    context = {}
    return render(request, 'analytics.html', context)


@login_required(login_url='/login/')
def test(request):
    qs_json = serializers.serialize('json', alerts.objects.all())
    return HttpResponse(qs_json, content_type='application/json')


@login_required(login_url='/login/')
def test1(request):
    return HttpResponse(alerts.objects.all().last().pk)


def user_login(request):
    context = {}
    print('LOGIN')
    if request.method == "POST":
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        print(user)
        if user:
            login(request, user)
            return HttpResponseRedirect('/')
        else:
            context["error"] = "Login Failed !"
            return render(request, "login.html", context=context)
    else:
        return render(request, "login.html", context={})


@login_required(login_url='/login/')
@cache_control(no_cache=True, must_revalidate=True, no_store=True)
def user_logout(request):
    if request.method == "GET":
        request.session.flush()
        logout(request)
        return HttpResponseRedirect('/')


@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url='/login/')
def workflow(request):
    t_monitoring={}
    if str(request.user)=="root":
        t_monitoring=ticket_monitoring.objects.all()
    return render(request, 'workflow.html', context={'all_rules': TimeRules.objects.all(),'admin':t_monitoring})


@cache_control(no_cache=True, must_revalidate=True, no_store=True)
@login_required(login_url='/login/')
def reports(request):
    return render(request, 'reports.html', context={'report':report.objects.all().order_by('-id')[:10]})


def scheduler(sch, now):
    cases = {'Daily': 3600*24,
             'Weekly': 3600*24*7,
             'Monthly': 3600*24*30}
    try:
        return cases[sch] + now
    except:
        return int(sch)*24*3600+now


def crt_report(args):
    view = args['view'].replace(" ", "").split('&')
    daily = datetime.now().strftime('%Y-%m-%d')
    for i in view:
        html = get_template("r_temp.html").render({'global': alerts.objects.filter(date__gte=daily + ' 00:00:00',
                                                                                   date__lte=daily + ' 23:59:59')})
        k = open('../Alfaros/templates/reports/{}-{}.{}'.format(args['name'],args['id'] , i), 'w+')
        if i == "PDF":
            response = BytesIO()
            pisa.pisaDocument(BytesIO(html.encode("UTF-8")), response)
            k.write(response.getvalue().decode("utf-8", "ignore"))
        else:
            k.write(html)
        k.close()


def report_handler(request):
    global rep,lock,rbreak
    lock.acquire()
    if request.GET['schedule'] == 'Once':
        r = report.objects.create(report_name=request.GET['title'],
                                  type="Custom",
                                  schedule=request.GET['schedule'],
                                  creation_date=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                                  next_run_time="None",
                                  owner=str(request.user),
                                  view=request.GET['format'])
        crt_report({'id':r.id,'name':request.GET['title'],'view':request.GET['format']})
    else:
        generate_report.objects.create(report_name=request.GET['title'],
                                          type="Custom",
                                          schedule=request.GET['schedule'],
                                          search=request.GET['search'],
                                          creation_date=datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
                                          next_run_time=0,
                                          owner=str(request.user),
                                          view=request.GET['format'])

        rbreak=1
    lock.release()
    return HttpResponse(True)


@start_new_thread
def do_report():
    global rep, lock,rbreak
    now = datetime.now().timestamp()
    while True:
        lock.acquire()
        if rbreak!=0 :
            swag_m = generate_report.objects.filter(next_run_time__lte=now)
            for i in swag_m.values():
                next = scheduler(i['schedule'], now)
                r = report.objects.create(report_name=i['report_name'],
                                         type=i['type'],
                                         schedule=i['schedule'],
                                         creation_date=datetime.fromtimestamp(now).strftime('%Y-%m-%d %H:%M:%S'),
                                         next_run_time=datetime.fromtimestamp(next).strftime('%Y-%m-%d %H:%M:%S'),
                                         owner=i['owner'],
                                         view=i['view'])
                generate_report.objects.filter(id=i['id']).update(next_run_time=next)
                crt_report({'id':r.id,'name':i['report_name'],'view':i['view']})
        mina = generate_report.objects.aggregate(Min('next_run_time'))['next_run_time__min']
        if mina == None:
           mina = 9999999999999
        rbreak=0
        lock.release()
        while True:
            time.sleep(5)
            now=datetime.now().timestamp()
            print(mina,now)
            if rbreak!=0 or mina<=now:
                rbreak=1
                print("report_break")
                break


def get_report(request):
    if request.GET['id'] == "reload":
        qs_json = serializers.serialize('json',
                                        report.objects.all().order_by('-id')[:int(request.GET['lstm'])])
    elif request.GET['lstm'] != "all":
        qs_json = serializers.serialize('json',
                                        report.objects.filter(id__lt=int(request.GET['id'])).order_by('-id')[:int(request.GET['lstm'])])
    else:
        qs_json = serializers.serialize('json',
                                        report.objects.filter(id__lt=int(request.GET['id'])).order_by('-id'))
    return HttpResponse(qs_json, content_type='application/json')


@start_new_thread
def do_ticket():
    global z, update_t
    while True:
        now = datetime.now().second
        lock_t.acquire()
        while len(z) > 0:
            update_t = []
            if ((now-z[0]['time']) > 6) or(abs((z[0]['time']+5) % 60-now) > 6):
                z.pop(0)
            else:
                for j in z:
                   update_t.append(j)
                break
        lock_t.release()
        time.sleep(1)


@csrf_exempt
def ticket(request):
    global z,lock_t,lock_m,tbreak,getall
    req = int(request.POST['id'])
    manager = str(request.user)
    status = request.POST['status']
    note = request.POST['note']
    row = alerts.objects.filter(id=req)
    row.update(manager=str(request.user), status=status, analyst_note=note)
    try:
        anal = row.values('manager')[0]['manager']
    except :
        return HttpResponse("Server Error: This alert might been updated please wait we're getting the update...")
    if(anal == "Pending...") or manager == anal:
        now = datetime.now()

        if status=="In Progress":
                lock_m.acquire()
                response=ticket_monitoring.objects.get(severity=row.values('severity')[0]['severity'])
                half=float(response.time)*30
                try:
                    open_ticket.objects.create(id=req, time=now.timestamp(),current=now.timestamp()+half, half=half, auto=response.auto_notify,expiring=float(response.notify_time)*60,expired= "0",manager=str(request.user))
                except:
                    pass
                tbreak = 1
                lock_m.release()
        elif len(open_ticket.objects.filter(id=req))>0:
            lock_m.acquire()
            tbreak = 1
            getall=1
            lock_m.release()
        lock_t.acquire()
        z.append({'id': req,
                  'manager': manager,
                  'status': status,
                  'note': note,
                  'time': now.second})
        lock_t.release()
        if status == "False Positive":
            false.objects.create(rule_name=row.values('rule_name')[0]['rule_name'],
                                 incident_type=row.values('incident_type')[0]['incident_type'],
                                 tool_alias=row.values('tool_alias')[0]['tool_alias'],
                                 date=row.values('date')[0]['date'],
                                 severity=row.values('severity')[0]['severity'],
                                 source=row.values('source')[0]['source'],
                                 destination=row.values('destination')[0]['destination'],
                                 is_threat=row.values('is_threat')[0]['is_threat'],
                                 manager=row.values('manager')[0]['manager'],
                                 status=row.values('status')[0]['status'])
        return HttpResponse("Done")

    else:
        return HttpResponse("Failed because the analyst << "+anal+" >> is currently working on this ticket")


def live(request):
    global update_t, track
    ids = request.GET['last_id']
    mono=serializers.serialize('json',open_ticket.objects.filter(manager=str(request.user)))
    if request.GET['notify'] == "false":
        return HttpResponse({'retry: 5000\nevent:live\ndata:'+serializers.serialize('json', alerts.objects.filter(id__gt=int(ids)))+'\n\nevent:update_t\ndata:'+json.dumps(update_t)+'\n\nevent:update_s\ndata:'+json.dumps(track)+'\n\nevent:mono\ndata:'+mono+'\n\n'}, content_type='text/event-stream')
    else:
        return HttpResponse({'retry: 5000\nevent:count\ndata:'+str(alerts.objects.filter(id__gt=int(ids),date__gte=request.GET['current']).count())+'\n\nevent:update_t\ndata:'+json.dumps(update_t)+'\n\nevent:update_s\ndata:'+json.dumps(track)+'\n\nevent:mono\ndata:'+mono+'\n\n'}, content_type='text/event-stream')


@start_new_thread
def do_severity():
    global sleepy, lock_s, track
    while True:
        tpm = 0
        lock_s.acquire()
        l = len(sleepy)
        if l > 0:
            mina = sleepy[tpm].date + sleepy[tpm].time * 3600
            for i in range(l):
                current = sleepy[tpm].date+sleepy[tpm].time*3600
                if current <= now:
                    if alerts.objects.get(id=sleepy[tpm].id).manager == "Pending...":
                        nss = min((sleepy[tpm].severity+sleepy[tpm].ns), 10)
                        nid = alerts.objects.all().last().id+1
                        alerts.objects.filter(id=sleepy[tpm].id).update(id=nid, severity=nss)
                        track.append({'pid': sleepy[tpm].id, 'nid': nid, 'nss': nss, 'time': now})
                        if nss==10 or sleepy[tpm].auto == "FALSE" or sleepy[tpm].status=="Disabled":
                            sleepy.pop(tpm)
                            tpm-=1
                        else:
                            sleepy[tpm].id = nid
                            sleepy[tpm].severity = nss
                            sleepy[tpm].date = now
                    else:
                        sleepy.pop(tpm)
                        tpm -= 1
                tpm += 1
                if mina > current:
                    mina = current
        else:
            mina = 9999999999
        l = len(sleepy)
        lock_s.release()
        while True:
            print("sleeping", l, sleepy, track)
            time.sleep(2)
            now = math.floor(datetime.now().timestamp())
            while len(track) > 0:
                if (now-track[0]['time']) > 10:
                    track.pop(0)
                else:
                    break
            if len(sleepy) != l or mina <= now:
                break


def severity_handler(i):
    global lock_s, sleepy
    lock_s.acquire()
    alert = alerts(date=datetime.fromtimestamp(int(i['properties']['DetectionTime'])/1000).strftime('%Y-%m-%d %H:%M:%S'),
                   rule_name=i['properties']['InferenceRule'],
                   tool_alias=i['properties']['ToolAlias'],
                   incident_type=i['type'],
                   severity=i['properties']['Severity'],
                   source=i['properties']['InsertionIP'],
                   destination=i['properties']['DetectionIP'])
    alert.save()
    try:
        new_rule=TimeRules.objects.get(rule_name=alert.rule_name)
        if new_rule:
            if new_rule.status == "Active":
                alert.time=float(new_rule.time)
                alert.date=math.floor(int(i['properties']['DetectionTime'])/1000)
                alert.ns=int(new_rule.severity)
                alert.auto=new_rule.autoincr
                alert.status="Active"
                sleepy.append(alert)
    except:
        TimeRules.objects.create(rule_name=i['properties']['InferenceRule'])
    lock_s.release()


def okbb(request):
    dic = [{"id": 1,
            "type": "InternalRuleFired",
            "data": None,
            "href": "https://10.220.10.8:8443/api/bec/alerts/1003923089",
            "properties": {"EventInfo": "The 'hulululu' rule fired",
                           "DetectionIP": "10.220.10.8",
                           "ToolAlias": "TriGeo",
                           "ProviderSID": None,
                           "InsertionIP": "swi-lem",
                           "DetectionTime": 1554600950683,
                           "ExtraneousInfo": "IncidentAlert [HostIncident]",
                           "Severity": 2,
                           "ManagerTime": 1554600950683,
                           "InsertionTime": 1554600950683,
                           "InferenceRule": "rule3",
                           "Manager": "swi-lem"}},
           {"id": 2,
            "type": "InternalRuleFired",
            "data": None,
            "href": "https://10.220.10.8:8443/api/bec/alerts/1003923422",
            "properties": {"EventInfo": "The 'rule1' rule fired",
                           "DetectionIP": "10.220.10.8",
                           "ToolAlias": "TriGeo",
                           "ProviderSID": None,
                           "InsertionIP": "swi-lem",
                           "DetectionTime": 1554644453525,
                           "ExtraneousInfo": "IncidentAlert [HostIncident]",
                           "Severity": 2,
                           "ManagerTime": 1554644453525,
                           "InsertionTime": 1554644453525,
                           "InferenceRule": "rule1",
                           "Manager": "swi-lem"}},
         {"id": 3,
          "type": "InternalRuleFired",
          "data": None,
          "href": "https://10.220.10.8:8443/api/bec/alerts/1003923426",
          "properties": {"EventInfo": "The 'rule1' rule fired",
                         "DetectionIP": "10.220.10.8",
                         "ToolAlias": "TriGeo",
                         "ProviderSID": None,
                         "InsertionIP": "swi-lem",
                         "DetectionTime": 1554644453526,
                         "ExtraneousInfo": "IncidentAlert [HostIncident]",
                         "Severity": 2,
                         "ManagerTime": 1554644453526,
                         "InsertionTime": 1554644453526,
                         "InferenceRule": "rule2",
                         "Manager": "swi-lem"}}]
    for i in dic:
        threading.Thread(name="s_handler", target=severity_handler, args=(i,)).start()
    return HttpResponse(True)


def update(request):
    global sleepy,lock_s
    rule_name=request.POST['name']
    time=request.POST['time']
    severity=request.POST['severity']
    status=request.POST['status']
    auto=request.POST['auto']
    TimeRules.objects.filter(rule_name=rule_name).update(time=time,
                                                         severity=severity,
                                                         status=status,
                                                         autoincr=auto)
    lock_s.acquire()
    for i in sleepy:
        if i.rule_name==rule_name:
            i.auto=auto
            i.ns=int(severity)
            i.time=float(time)
            i.status=status
    lock_s.release()
    return HttpResponse(True)


def rtemp(request):
    if request.GET['type'] == 'HTML':
        return render(request, 'reports/{}-{}.HTML'.format(request.GET['name'], request.GET['id']))
    else:
        return FileResponse(open('../Alfaros/templates/reports/{}-{}.PDF'.format(request.GET['name'], request.GET['id']), 'rb'), content_type='application/pdf')

@start_new_thread
def swag():
    global lock_m,tbreak,getall
    while True:
        lock_m.acquire()
        if tbreak!=0:
            if not getall:
                swag_m=open_ticket.objects.filter(current__lte=now)
            else:
                swag_m = open_ticket.objects.all()
                getall = 0
            if(len(swag_m)>0):
                for i in swag_m.values():
                        try:
                            response=alerts.objects.get(id=i['id'])
                            if response.status != "In Progress":
                                open_ticket.objects.filter(id=i['id']).delete()
                            else:
                                if now >= i['time'] + 2 * i['half']:
                                    if i['auto'] == "DISABLED" and i['expired']:
                                        open_ticket.objects.filter(id=i['id']).delete()
                                    else:
                                        current=now+i['expiring']
                                        open_ticket.objects.filter(id=i['id']).update(expired=1,current=current)
                                else:
                                    current = now + float(i['half'])
                                    open_ticket.objects.filter(id=i['id']).update(current=current)
                        except:
                            print("error")
                            pass
        tbreak = 0
        mina = open_ticket.objects.aggregate(Min('current'))['current__min']
        if mina==None:
            mina=9999999999999
        lock_m.release()
        while True:
            time.sleep(2)
            now=datetime.now().timestamp()
            if tbreak!=0 or mina<=now:
                tbreak=1
                print("break")
                break

def ticketmono(request):
    return HttpResponse(serializers.serialize('json',ticket_monitoring.objects.all()),content_type='application/json')

def time_rule(request):
    return HttpResponse(serializers.serialize('json',TimeRules.objects.all()),content_type='application/json')

def greport(request):
    if request.method=="POST":
        if request.POST['action'] == "upt":
             generate_report.objects.filter(id=request.POST['id']).update(report_name=request.POST['name'],schedule=request.POST['schedule'], view=request.POST['view'])
             return HttpResponse("Done")
        elif request.POST['action'] == "del":
            args = request.POST['arr'].split(",")
            for i in args:
                generate_report.objects.filter(id=i).delete()
            return HttpResponse("Done")
    if request.method=="GET":
        return HttpResponse(serializers.serialize('json',generate_report.objects.all(),fields=['report_name','schedule','creation_date','next_run_time','owner','view']),content_type='application/json')

def ticket_monitoring_handler(request):
    if request.method=="POST":
        if request.POST['action']=="del":
            args=request.POST['arr'].split(",")
            for i in args:
                ticket_monitoring.objects.filter(severity=i).delete()
            return HttpResponse("Done")
        elif request.POST['action'] == "crt":
                try:
                    ticket_monitoring.objects.create(severity=request.POST['severity'],time=request.POST['time'],auto_notify=request.POST['an'],notify_time=request.POST['nt'])
                    return HttpResponse("Done")
                except:
                    return HttpResponse("Server Warning : This Severity Level Already Exist")

        elif request.POST['action'] == "upt":
            ticket_monitoring.objects.filter(severity=request.POST['severity']).update(time=request.POST['time'],auto_notify=request.POST['an'], notify_time=request.POST['nt'])
            return HttpResponse("Done")