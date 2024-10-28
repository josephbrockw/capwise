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
    html = f"""
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
    """
    return mark_safe(html)


@register.simple_tag
def paragraph(text):
    """
    Renders a paragraph with inline styles.
    Usage:
        {% paragraph 'This is a paragraph.' %}
    """
    html = f"""
    <p style="">{text}</p>
    """
    return mark_safe(html)


@register.simple_tag
def section_header(text):
    """
    Renders a section header with inline styles.
    Usage:
        {% section_header 'This is a section header.' %}
    """
    html = f"""
    <div style="background-color: #333; color: #fff; width: 100%;
    padding: 1rem 0; margin: 1.5rem 0 1rem; border-radius: 3px;">
        <h2 style="margin: 0; padding: 0 20px;">{text}</h2>
    </div>
    """
    return mark_safe(html)


@register.simple_tag
def section_subheader(text):
    """
    Renders a section subheader with inline styles.
    Usage:
        {% section_subheader 'This is a section subheader.' %}
    """
    html = f"""
    <h3 style="margin: 0; padding: .5rem 0; color: #4caf50;
    font-size: 1.5rem; margin-bottom: .5rem;">{text}</h3>
    """
    return mark_safe(html)


@register.simple_tag
def divider():
    """
    Renders a divider.
    Usage:
        {% divider %}
    """
    return mark_safe("<hr style='border: 1px solid #ccc; margin: 20px 0;'>")


@register.simple_tag
def bold_text(text):
    """
    Renders bold text.
    Usage:
        {% bold_text 'This is bold text.' %}
    """
    return mark_safe(f"<strong>{text}</strong>")


@register.simple_tag
def unordered_list(items):
    list_items = "".join(f"<li>{item}</li>" for item in items)
    html = f"<ul style='padding-left: 20px;'>{list_items}</ul>"
    return mark_safe(html)


@register.simple_tag
def ordered_list(items):
    list_items = "".join(f"<li>{item}</li>" for item in items)
    html = f"<ol style='padding-left: 20px;'>{list_items}</ol>"
    return mark_safe(html)


@register.simple_tag
def table(headers, rows):
    headers_html = "".join(f"<th>{header}</th>" for header in headers)
    rows_html = ""
    for row in rows:
        row_html = "".join(
            f"<td style='text-align: center;'>{cell}</td>" for cell in row
        )
        rows_html += f"<tr>{row_html}</tr>"

    html = f"""
    <table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">
        <thead><tr>{headers_html}</tr></thead>
        <tbody>{rows_html}</tbody>
    </table>
    """
    return mark_safe(html)


@register.simple_tag
def space():
    """
    Renders a space.
    Usage:
        {% space %}
    """
    return mark_safe("<div style='display: block; height: 2rem;'></div>")
