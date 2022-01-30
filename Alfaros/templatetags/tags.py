from django import template

register = template.Library()

@register.filter()
def absolu(value,x=0):
    return abs(value-x)


@register.filter()
def rang(value,args="24,4"):
    arg_list = [int(arg) for arg in args.split(',')]
    return range(value-arg_list[0],value-arg_list[1])


@register.filter()
def fstrip(value):

    k=str(value).split(".")
    if(int(k[1])==0):
        return int(k[0])
    else:
        return value

@register.filter()
def far(value):
    try:
        int(value)
        return value+" Days"
    except:
        return value

@register.filter()
def args(value):
    return(value.split('&'))