from django.template import Context, Template
from django.test import SimpleTestCase


class TemplateTagsTest(SimpleTestCase):
    def render_template(self, template_string, context=None):
        context = context or {}
        template = Template(template_string)
        return template.render(Context(context)).strip()

    def test_cta_button(self):
        rendered = self.render_template(
            "{% load email_tags %}{% cta_button 'http://example.com' 'Click Here' %}"
        )
        self.assertIn("<p>", rendered)
        self.assertIn('<a href="http://example.com"', rendered)
        self.assertIn("display: inline-block;", rendered)
        self.assertIn("padding: 12px 20px;", rendered)
        self.assertIn("background-color: #4CAF50;", rendered)
        self.assertIn("color: #ffffff;", rendered)
        self.assertIn("text-decoration: none;", rendered)
        self.assertIn("border-radius: 5px;", rendered)
        self.assertIn("font-size: 16px;", rendered)
        self.assertIn(">Click Here</a>", rendered)
        self.assertIn("</p>", rendered)

    def test_paragraph(self):
        rendered = self.render_template(
            "{% load email_tags %}{% paragraph 'This is a paragraph.' %}"
        )
        expected = '<p style="">This is a paragraph.</p>'
        self.assertHTMLEqual(rendered, expected)

    def test_section_header(self):
        rendered = self.render_template(
            "{% load email_tags %}{% section_header 'This is a section header.' %}"
        )
        self.assertIn(
            '<div style="background-color: #333; color: #fff; width: 100%;', rendered
        )
        self.assertIn(
            'padding: 1rem 0; margin: 1.5rem 0 1rem; border-radius: 3px;">', rendered
        )
        self.assertIn(
            '<h2 style="margin: 0; padding: 0 20px;">This is a section header.</h2>',
            rendered,
        )
        self.assertIn("</div>", rendered)

    def test_section_subheader(self):
        rendered = self.render_template(
            "{% load email_tags %}{% section_subheader 'This is a "
            "section subheader.' %}"
        )
        self.assertIn(
            '<h3 style="margin: 0; padding: .5rem 0; color: #4caf50;', rendered
        )
        self.assertIn(
            'font-size: 1.5rem; margin-bottom: .5rem;">This is a section '
            "subheader.</h3>",
            rendered,
        )

    def test_divider(self):
        rendered = self.render_template("{% load email_tags %}{% divider %}")
        expected = "<hr style='border: 1px solid #ccc; margin: 20px 0;'>"
        self.assertHTMLEqual(rendered, expected)

    def test_bold_text(self):
        rendered = self.render_template(
            "{% load email_tags %}{% bold_text 'This is bold text.' %}"
        )
        expected = "<strong>This is bold text.</strong>"
        self.assertHTMLEqual(rendered, expected)

    def test_unordered_list(self):
        rendered = self.render_template(
            "{% load email_tags %}{% unordered_list items %}",
            context={"items": ["Item 1", "Item 2"]},
        )
        expected = "<ul style='padding-left: 20px;'><li>Item 1</li><li>Item 2</li></ul>"
        self.assertHTMLEqual(rendered, expected)

    def test_ordered_list(self):
        rendered = self.render_template(
            "{% load email_tags %}{% ordered_list items %}",
            context={"items": ["First", "Second"]},
        )
        expected = "<ol style='padding-left: 20px;'><li>First</li><li>Second</li></ol>"
        self.assertHTMLEqual(rendered, expected)

    def test_table(self):
        headers = ["Name", "Age"]
        rows = [["John", "30"], ["Jane", "25"]]
        rendered = self.render_template(
            "{% load email_tags %}{% table headers rows %}",
            context={"headers": headers, "rows": rows},
        )
        self.assertIn(
            '<table style="width: 100%; border-collapse: collapse; margin: 1rem 0;">',
            rendered,
        )
        self.assertIn("<thead><tr><th>Name</th><th>Age</th></tr></thead>", rendered)
        self.assertIn(
            "<tbody><tr><td style='text-align: center;'>John</td><td "
            "style='text-align: center;'>30</td></tr>",
            rendered,
        )
        self.assertIn(
            "<tr><td style='text-align: center;'>Jane</td><td "
            "style='text-align: center;'>25</td></tr></tbody>",
            rendered,
        )
        self.assertIn("</table>", rendered)

    def test_space(self):
        rendered = self.render_template("{% load email_tags %}{% space %}")
        expected = "<div style='display: block; height: 2rem;'></div>"
        self.assertHTMLEqual(rendered, expected)
