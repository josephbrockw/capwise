from django import template
from django.utils.safestring import mark_safe

register = template.Library()


@register.simple_tag
def cta_button(url, text):
    """
    Renders a CTA button with inline styles.
    Usage:
        {% cta_button 'http://example.com' 'Click Here' %}
    """
    html = f'''
    <p>
        <a href="{url}" style="
            display: inline-block;
            padding: 12px 20px;
            background-color: #4CAF50;
            color: #ffffff;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
        ">{text}</a>
    </p>
    '''
    return mark_safe(html)


@register.simple_tag
def paragraph(text):
    """
    Renders a paragraph with inline styles.
    Usage:
        {% paragraph 'This is a paragraph.' %}
    """
    html = f'''
    <p style="">{text}</p>
    '''
    return mark_safe(html)