// GET /api/products/document/[attachmentId] - Download document from Odoo
import { NextRequest, NextResponse } from 'next/server';
import { odooApiCall } from '@/lib/server/odoo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> }
) {
  try {
    const { attachmentId } = await params;
    const attId = parseInt(attachmentId);

    // Fetch the attachment data including the binary content
    const attachments = await odooApiCall<Array<{ name: string; mimetype: string; datas: string }>>(
      'ir.attachment',
      'search_read',
      [[['id', '=', attId]]],
      { fields: ['name', 'mimetype', 'datas'] }
    );

    if (attachments.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const attachment = attachments[0];

    // datas is base64 encoded
    const fileBuffer = Buffer.from(attachment.datas, 'base64');

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': attachment.mimetype || 'application/pdf',
        'Content-Disposition': `attachment; filename="${attachment.name}"`,
        'Content-Length': fileBuffer.length.toString()
      }
    });
  } catch (error) {
    console.error('Error downloading document:', error);
    return NextResponse.json({ error: 'Failed to download document' }, { status: 500 });
  }
}
