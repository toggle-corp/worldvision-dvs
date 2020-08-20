import xmltodict
import logging
import os
import re

logger = logging.getLogger(__name__)


DATE_PATTERN = re.compile(r'.*\s(\d{1,2}/\d{1,2}/\d{4}).*')


def parse_xml(xml_content):
    return xmltodict.parse(xml_content)


def convert_to_int(_string, default=None):
    try:
        string = _string.replace(',', '')
        return int(string)
    except (ValueError, TypeError):
        return default


def delete_file(path):
    """ Deletes file from filesystem. """
    if os.path.isfile(path):
        os.remove(path)
        logger.warn('File Delete successfully: {}'.format(path))
