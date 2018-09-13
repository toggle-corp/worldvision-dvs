import xmltodict
import logging
import os

logger = logging.getLogger(__name__)


def parse_xml(xml_content):
    return xmltodict.parse(xml_content)


def delete_file(path):
    """ Deletes file from filesystem. """
    if os.path.isfile(path):
        os.remove(path)
        logger.warn('File Delete successfully: {}'.format(path))
