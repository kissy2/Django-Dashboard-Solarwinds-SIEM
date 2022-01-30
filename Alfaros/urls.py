from django.urls import path, include
from . import views


urlpatterns = [
path('',views.Dashboard, name='dashboard'),
path('api/data',views.test),
path('analytics/',views.analytics, name='analytics'),
path('get_alerts_count',views.test1),
path('login/', views.user_login),
path('logout/', views.user_logout, name='logout'),
path('workflow/', views.workflow, name='workflow'),
path('reports/', views.reports, name="reports"),
path('grougrou/',views.report_handler),
path('ticket/',views.ticket),
path('live/',views.live),
path('okbb/',views.okbb),
path('update/',views.update),
path('rtemp/',views.rtemp),
path('api/report/',views.get_report),
path('ticket_monitoring/',views.ticketmono),
path('time_rule/',views.time_rule),
path('greport/',views.greport),
path('ticket_monitoring_handler/',views.ticket_monitoring_handler),




]
