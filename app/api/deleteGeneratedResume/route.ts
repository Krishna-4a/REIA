import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: Request) {
    try {
        const { generatedResumeId } = await request.json();

        // Delete the Generated_Resume record
        await prisma.generated_Resume.delete({
            where: { id: generatedResumeId },
        });

        return NextResponse.json({ message: 'Generated resume deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error("Error deleting generated resume:", error);
        return NextResponse.json({ error: 'Failed to delete generated resume' }, { status: 500 });
    }
}
