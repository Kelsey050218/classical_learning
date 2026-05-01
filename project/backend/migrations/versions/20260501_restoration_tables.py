"""Create restoration tables

Revision ID: 20260501_restoration_tables
Revises:
Create Date: 2026-05-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '20260501_restoration_tables'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create restoration_chapters table
    op.create_table(
        'restoration_chapters',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('chapter_id', sa.Integer(), sa.ForeignKey('chapters.id'), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('alias', sa.String(length=50), nullable=False),
        sa.Column('description', sa.String(length=200), nullable=False),
        sa.Column('difficulty', sa.Enum('easy', 'medium', 'hard', native_enum=False), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=True, default=0),
        sa.Column('image_url', sa.String(length=500), nullable=True),
        sa.Column('era_quote', sa.Text(), nullable=False),
        sa.Column('positioning', sa.String(length=200), nullable=False),
        sa.Column('archive_summary', sa.Text(), nullable=False),
        sa.Column('archive_impact', sa.Text(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_restoration_chapters_id'), 'restoration_chapters', ['id'], unique=False)

    # Create restoration_fragments table
    op.create_table(
        'restoration_fragments',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('chapter_id', sa.Integer(), sa.ForeignKey('restoration_chapters.id'), nullable=False),
        sa.Column('content', sa.String(length=300), nullable=False),
        sa.Column('category', sa.Enum('era', 'author', 'content', 'style', 'impact', native_enum=False), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=True, default=0),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_restoration_fragments_id'), 'restoration_fragments', ['id'], unique=False)

    # Create restoration_diagnostics table
    op.create_table(
        'restoration_diagnostics',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('chapter_id', sa.Integer(), sa.ForeignKey('restoration_chapters.id'), nullable=False),
        sa.Column('question_type', sa.Enum('choice', 'fill_blank', native_enum=False), nullable=False),
        sa.Column('content', sa.String(length=500), nullable=False),
        sa.Column('options', sa.JSON(), nullable=True),
        sa.Column('correct_answer', sa.String(length=200), nullable=False),
        sa.Column('hint', sa.Text(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=True, default=0),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_restoration_diagnostics_id'), 'restoration_diagnostics', ['id'], unique=False)

    # Create restoration_nodes table
    op.create_table(
        'restoration_nodes',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('chapter_id', sa.Integer(), sa.ForeignKey('restoration_chapters.id'), nullable=False),
        sa.Column('content', sa.String(length=200), nullable=False),
        sa.Column('correct_order', sa.Integer(), nullable=False),
        sa.Column('sort_order', sa.Integer(), nullable=True, default=0),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_restoration_nodes_id'), 'restoration_nodes', ['id'], unique=False)

    # Create restoration_progress table
    op.create_table(
        'restoration_progress',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('chapter_id', sa.Integer(), sa.ForeignKey('restoration_chapters.id'), nullable=False),
        sa.Column('current_step', sa.Enum('locked', 'diagnostic', 'sorting', 'sequencing', 'archive', 'completed', native_enum=False), nullable=True),
        sa.Column('diagnostic_correct', sa.Integer(), nullable=True, default=0),
        sa.Column('sorting_correct', sa.Integer(), nullable=True, default=0),
        sa.Column('sorting_completed', sa.Boolean(), nullable=True, default=False),
        sa.Column('sequencing_attempts', sa.Integer(), nullable=True, default=0),
        sa.Column('sequencing_completed', sa.Boolean(), nullable=True, default=False),
        sa.Column('archive_completed', sa.Boolean(), nullable=True, default=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'chapter_id', name='uix_user_chapter_progress')
    )
    op.create_index(op.f('ix_restoration_progress_id'), 'restoration_progress', ['id'], unique=False)

    # Create restoration_notes table
    op.create_table(
        'restoration_notes',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.text('now()'), nullable=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('chapter_id', sa.Integer(), sa.ForeignKey('restoration_chapters.id'), nullable=False),
        sa.Column('note', sa.String(length=200), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'chapter_id', name='uix_user_chapter_note')
    )
    op.create_index(op.f('ix_restoration_notes_id'), 'restoration_notes', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_restoration_notes_id'), table_name='restoration_notes')
    op.drop_table('restoration_notes')

    op.drop_index(op.f('ix_restoration_progress_id'), table_name='restoration_progress')
    op.drop_table('restoration_progress')

    op.drop_index(op.f('ix_restoration_nodes_id'), table_name='restoration_nodes')
    op.drop_table('restoration_nodes')

    op.drop_index(op.f('ix_restoration_diagnostics_id'), table_name='restoration_diagnostics')
    op.drop_table('restoration_diagnostics')

    op.drop_index(op.f('ix_restoration_fragments_id'), table_name='restoration_fragments')
    op.drop_table('restoration_fragments')

    op.drop_index(op.f('ix_restoration_chapters_id'), table_name='restoration_chapters')
    op.drop_table('restoration_chapters')
