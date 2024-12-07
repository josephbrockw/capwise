from django.contrib import admin

from payment.models import Price, Product, Subscription, Tier

admin.site.register(Product)
admin.site.register(Tier)
admin.site.register(Subscription)
admin.site.register(Price)
