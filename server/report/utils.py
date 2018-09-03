import xmltodict


def parse_xml(xml_content):
    return xmltodict.parse(xml_content)
